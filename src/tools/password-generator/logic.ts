export interface PasswordOptions {
  length: number;
  upper: boolean;
  lower: boolean;
  digits: boolean;
  symbols: boolean;
  /** Drop look-alike characters such as 0/O, 1/l/I. */
  excludeAmbiguous: boolean;
}

/** Fills the array with uniformly random 32-bit integers. Injected for testability. */
export type RandomSource = (array: Uint32Array) => Uint32Array;

const SETS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/~',
} as const;

const AMBIGUOUS = /[O0oIl1|]/g;

export const MIN_LENGTH = 4;
export const MAX_LENGTH = 128;

const defaultRandom: RandomSource = (array) => {
  crypto.getRandomValues(array as Uint32Array<ArrayBuffer>);
  return array;
};

/** Unbiased integer in [0, max) using rejection sampling. */
function randomIndex(max: number, random: RandomSource): number {
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  const buf = new Uint32Array(1);
  let value: number;
  do {
    value = random(buf)[0];
  } while (value >= limit);
  return value % max;
}

export function activeSets(options: PasswordOptions): string[] {
  return (Object.keys(SETS) as (keyof typeof SETS)[])
    .filter((key) => options[key])
    .map((key) => (options.excludeAmbiguous ? SETS[key].replace(AMBIGUOUS, '') : SETS[key]));
}

/**
 * Generates a password containing at least one character from every selected set.
 * Returns '' when no set is selected.
 */
export function generatePassword(options: PasswordOptions, random: RandomSource = defaultRandom): string {
  const sets = activeSets(options);
  if (sets.length === 0) return '';
  const length = Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, Math.floor(options.length), sets.length));
  const pool = sets.join('');

  const chars = sets.map((set) => set[randomIndex(set.length, random)]);
  while (chars.length < length) chars.push(pool[randomIndex(pool.length, random)]);

  // Fisher–Yates so the guaranteed characters are not always at the front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1, random);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

export type Strength = 'weak' | 'fair' | 'strong' | 'very-strong';

/** Entropy in bits for a password drawn uniformly from the selected pool. */
export function entropyBits(options: PasswordOptions): number {
  const poolSize = activeSets(options).join('').length;
  return poolSize === 0 ? 0 : options.length * Math.log2(poolSize);
}

export function strengthOf(bits: number): Strength {
  if (bits < 45) return 'weak';
  if (bits < 70) return 'fair';
  if (bits < 100) return 'strong';
  return 'very-strong';
}

export const STRENGTH_LABEL: Record<Strength, string> = {
  weak: '弱',
  fair: '普通',
  strong: '強',
  'very-strong': '非常強',
};
