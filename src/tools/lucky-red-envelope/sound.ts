// Browser-only: the sounds of opening an envelope, synthesised with Web Audio, so no audio files are
// involved. The context starts on the first press, because browsers keep audio locked until a gesture.

type Sound = (ctx: BaseAudioContext, out: AudioNode, at: number) => void;

const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();

function noiseBuffer(ctx: BaseAudioContext): AudioBuffer {
  let buffer = noiseBuffers.get(ctx);
  if (!buffer) {
    buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffers.set(ctx, buffer);
  }
  return buffer;
}

/** One pitched note with a fast attack and an exponential fade. */
function tone(ctx: BaseAudioContext, out: AudioNode, hz: number, at: number, length: number, peak: number, type: OscillatorType = 'sine', glideTo = hz): void {
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(peak, at + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, at + length);
  env.connect(out);
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(hz, at);
  if (glideTo !== hz) osc.frequency.exponentialRampToValueAtTime(glideTo, at + length);
  osc.connect(env);
  osc.start(at);
  osc.stop(at + length + 0.02);
  osc.onended = () => env.disconnect();
}

/** A burst of band-passed noise whose filter sweeps from one frequency to another. */
function hiss(ctx: BaseAudioContext, out: AudioNode, at: number, length: number, peak: number, hz: number, sweepTo: number): void {
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(peak, at + 0.02);
  env.gain.exponentialRampToValueAtTime(0.0001, at + length);
  env.connect(out);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 0.9;
  filter.frequency.setValueAtTime(hz, at);
  filter.frequency.exponentialRampToValueAtTime(sweepTo, at + length);
  filter.connect(env);
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx);
  source.connect(filter);
  source.start(at, Math.random() * 0.8, length + 0.02);
  source.onended = () => env.disconnect();
}

/** A sine note with a quiet inharmonic partial, which is what makes a tone ring like a coin. */
function coin(ctx: BaseAudioContext, out: AudioNode, hz: number, at: number, length: number, peak: number): void {
  tone(ctx, out, hz, at, length, peak);
  tone(ctx, out, hz * 2.76, at, length * 0.45, peak * 0.22);
}

export const SOUNDS = {
  /** The flap tearing open, then two coins. */
  open(ctx, out, at) {
    hiss(ctx, out, at, 0.22, 0.34, 700, 3600);
    coin(ctx, out, 1568, at + 0.2, 0.32, 0.18);
    coin(ctx, out, 2093, at + 0.29, 0.42, 0.18);
  },
  /** Every envelope at once: a longer rustle under a run of coins. */
  openAll(ctx, out, at) {
    hiss(ctx, out, at, 0.5, 0.3, 600, 4200);
    [1319, 1568, 1760, 2093, 2637].forEach((hz, i) => coin(ctx, out, hz, at + 0.12 + i * 0.07, 0.4, 0.14));
  },
  /** The last envelope is open: a short rising fanfare ending on a held chord. */
  finish(ctx, out, at) {
    [784, 1047, 1319].forEach((hz, i) => tone(ctx, out, hz, at + i * 0.13, 0.26, 0.2, 'triangle'));
    for (const hz of [1047, 1319, 1568]) tone(ctx, out, hz, at + 0.39, 1.1, 0.15, 'triangle');
    tone(ctx, out, 523, at + 0.39, 1.1, 0.16);
    coin(ctx, out, 2093, at + 0.39, 1.05, 0.12);
  },
} satisfies Record<string, Sound>;

export type SoundName = keyof typeof SOUNDS;

const LEVEL = 1;

export class EnvelopeSounds {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private on: boolean;

  constructor(on: boolean) {
    this.on = on;
  }

  get enabled(): boolean {
    return this.on;
  }

  /** Muting also silences anything still ringing. */
  setEnabled(on: boolean): void {
    this.on = on;
    if (this.master) this.master.gain.value = on ? LEVEL : 0;
  }

  play(name: SoundName, delay = 0): void {
    if (!this.on) return;
    try {
      if (!this.ctx) {
        this.ctx = new AudioContext();
        this.master = this.ctx.createGain();
        this.master.gain.value = LEVEL;
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      SOUNDS[name](this.ctx, this.master!, this.ctx.currentTime + 0.005 + delay);
    } catch {
      /* audio unavailable */
    }
  }
}
