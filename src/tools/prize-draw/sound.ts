// Browser-only: the sounds of the draw, synthesised with Web Audio, so no licensed audio is involved.
// The context starts on the first press, because browsers keep audio locked until a user gesture.

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

/** A burst of filtered noise; the filter can sweep from one frequency to another. */
function hiss(ctx: BaseAudioContext, out: AudioNode, at: number, length: number, peak: number, hz: number, sweepTo = hz, q = 1, attack = 0.006): void {
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(peak, at + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, at + length);
  env.connect(out);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = q;
  filter.frequency.setValueAtTime(hz, at);
  if (sweepTo !== hz) filter.frequency.exponentialRampToValueAtTime(sweepTo, at + length);
  filter.connect(env);
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx);
  source.connect(filter);
  source.start(at, Math.random() * 0.8, length + 0.02);
  source.onended = () => env.disconnect();
}

/** A sine note with a quiet inharmonic partial, which is what makes a tone read as a bell. */
function bell(ctx: BaseAudioContext, out: AudioNode, hz: number, at: number, length: number, peak: number): void {
  tone(ctx, out, hz, at, length, peak);
  tone(ctx, out, hz * 2.76, at, length * 0.45, peak * 0.22);
}

/** A brass-like note: a triangle with a quieter sawtooth an octave below. */
function brass(ctx: BaseAudioContext, out: AudioNode, hz: number, at: number, length: number, peak: number): void {
  tone(ctx, out, hz, at, length, peak, 'triangle');
  tone(ctx, out, hz / 2, at, length, peak * 0.3, 'sawtooth');
}

export const SOUNDS = {
  /** One name flicking past while the draw is rolling; called for every change. */
  tick(ctx, out, at) {
    tone(ctx, out, 1250, at, 0.045, 0.11, 'triangle', 900);
  },
  /** A winner showing: a cymbal splash under a rising run of bells. */
  reveal(ctx, out, at) {
    hiss(ctx, out, at, 0.5, 0.16, 6000, 4200, 0.6);
    [1047, 1319, 1568, 2093].forEach((hz, i) => bell(ctx, out, hz, at + i * 0.085, i === 3 ? 0.85 : 0.5, 0.2));
  },
  /** The last winner of a prize: a fanfare that climbs to a held chord, with a crash on top. */
  fanfare(ctx, out, at) {
    [523, 523, 523, 659].forEach((hz, i) => brass(ctx, out, hz, at + [0, 0.14, 0.28, 0.42][i], i === 3 ? 0.3 : 0.13, 0.2));
    brass(ctx, out, 784, at + 0.72, 0.24, 0.2);
    brass(ctx, out, 659, at + 0.96, 0.12, 0.18);
    const chord = at + 1.1;
    for (const hz of [523, 659, 784, 1047]) brass(ctx, out, hz, chord, 1.5, 0.15);
    hiss(ctx, out, chord, 1.3, 0.22, 7000, 3800, 0.5);
    bell(ctx, out, 2093, chord, 1.3, 0.12);
    bell(ctx, out, 2637, chord + 0.12, 1.2, 0.1);
  },
} satisfies Record<string, Sound>;

export type SoundName = keyof typeof SOUNDS;

const LEVEL = 1;

export class DrawSounds {
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

  play(name: SoundName): void {
    if (!this.on) return;
    try {
      if (!this.ctx) {
        this.ctx = new AudioContext();
        this.master = this.ctx.createGain();
        this.master.gain.value = LEVEL;
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      SOUNDS[name](this.ctx, this.master!, this.ctx.currentTime + 0.005);
    } catch {
      /* audio unavailable */
    }
  }
}
