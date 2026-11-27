// Browser-only: short sound effects synthesised with Web Audio, so no licensed audio is involved.
// The context starts on the first tap, because browsers keep audio locked until a user gesture.

type Sound = (ctx: BaseAudioContext, out: AudioNode, at: number) => void;

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

/** A sine note with a quiet inharmonic partial, which is what makes a tone read as a bell. */
function bell(ctx: BaseAudioContext, out: AudioNode, hz: number, at: number, length: number, peak: number): void {
  tone(ctx, out, hz, at, length, peak);
  tone(ctx, out, hz * 2.76, at, length * 0.45, peak * 0.22);
}

export const SOUNDS = {
  /** One ball knocking past while the cage turns; called repeatedly during the roll. */
  tick(ctx, out, at) {
    tone(ctx, out, 700 + Math.random() * 500, at, 0.045, 0.16, 'triangle');
  },
  /** The ball dropping out: a low knock and two bells. */
  reveal(ctx, out, at) {
    tone(ctx, out, 220, at, 0.16, 0.34, 'sine', 110);
    bell(ctx, out, 1319, at + 0.03, 0.5, 0.2);
    bell(ctx, out, 1976, at + 0.12, 0.7, 0.18);
  },
  /** Taking the last ball back. */
  undo(ctx, out, at) {
    tone(ctx, out, 520, at, 0.14, 0.22, 'triangle', 300);
  },
  /** Every number is out: a short fanfare ending on a held chord. */
  finish(ctx, out, at) {
    [784, 1047, 1319].forEach((hz, i) => tone(ctx, out, hz, at + i * 0.13, 0.26, 0.2, 'triangle'));
    for (const hz of [1047, 1319, 1568]) tone(ctx, out, hz, at + 0.39, 1.15, 0.15, 'triangle');
    tone(ctx, out, 523, at + 0.39, 1.15, 0.16);
    bell(ctx, out, 2093, at + 0.39, 1.1, 0.12);
  },
} satisfies Record<string, Sound>;

export type SoundName = keyof typeof SOUNDS;

export class BingoSounds {
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
    if (this.master) this.master.gain.value = on ? 1 : 0;
  }

  play(name: SoundName): void {
    if (!this.on) return;
    try {
      if (!this.ctx) {
        this.ctx = new AudioContext();
        this.master = this.ctx.createGain();
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      SOUNDS[name](this.ctx, this.master!, this.ctx.currentTime + 0.005);
    } catch {
      /* audio unavailable */
    }
  }
}
