import { describe, expect, it } from 'vitest';
import {
  computeGpa,
  cumulativeGpa,
  gradePoints,
  GRADES,
  isGrade,
  PERCENT_RANGES,
  requiredGpa,
  roundGpa,
  weightedPoints,
  type Course,
} from './logic';

describe('gradePoints', () => {
  it.each([
    ['A+', 4.0],
    ['A', 4.0],
    ['A-', 3.7],
    ['B+', 3.3],
    ['B', 3.0],
    ['B-', 2.7],
    ['C+', 2.3],
    ['C', 2.0],
    ['C-', 1.7],
    ['D+', 1.3],
    ['D', 1.0],
    ['D-', 0.7],
    ['F', 0],
  ] as const)('%s = %s', (grade, points) => {
    expect(gradePoints(grade)).toBe(points);
  });

  it('optionally counts A+ as 4.3', () => {
    expect(gradePoints('A+', { aPlus43: true })).toBe(4.3);
    expect(gradePoints('A', { aPlus43: true })).toBe(4.0);
  });

  it('every grade has a percent range', () => {
    for (const g of GRADES) expect(PERCENT_RANGES[g]).toBeTruthy();
  });
});

describe('weightedPoints', () => {
  it('adds 0.5 for honors and 1.0 for AP', () => {
    expect(weightedPoints('A', 'honors')).toBe(4.5);
    expect(weightedPoints('A', 'ap')).toBe(5.0);
    expect(weightedPoints('B+', 'ap')).toBeCloseTo(4.3, 10);
    expect(weightedPoints('B', 'regular')).toBe(3.0);
  });
  it('gives no bonus to an F', () => {
    expect(weightedPoints('F', 'ap')).toBe(0);
    expect(weightedPoints('F', 'honors')).toBe(0);
  });
});

describe('isGrade', () => {
  it('accepts only known letter grades', () => {
    expect(isGrade('B-')).toBe(true);
    expect(isGrade('E')).toBe(false);
    expect(isGrade('')).toBe(false);
    expect(isGrade('a')).toBe(false);
  });
});

describe('computeGpa', () => {
  const courses: Course[] = [
    { grade: 'A', credits: 3, level: 'regular' },
    { grade: 'B+', credits: 4, level: 'honors' },
    { grade: 'A-', credits: 3, level: 'ap' },
    { grade: 'C', credits: 2, level: 'regular' },
  ];

  it('computes credit-weighted unweighted and weighted GPA', () => {
    const r = computeGpa(courses);
    // QP = 12 + 13.2 + 11.1 + 4 = 40.3 over 12 credits
    expect(r.credits).toBe(12);
    expect(r.qualityPoints).toBeCloseTo(40.3, 10);
    expect(r.unweighted).toBeCloseTo(40.3 / 12, 10);
    expect(roundGpa(r.unweighted)).toBe(3.36);
    // Weighted adds 4 × 0.5 + 3 × 1.0 = 5 → 45.3 / 12
    expect(r.weightedQualityPoints).toBeCloseTo(45.3, 10);
    expect(roundGpa(r.weighted)).toBe(3.78);
    expect(r.counted).toBe(4);
  });

  it('skips rows without a grade or with invalid credits', () => {
    const r = computeGpa([
      { grade: 'A', credits: 3, level: 'regular' },
      { grade: '', credits: 3, level: 'regular' },
      { grade: 'B', credits: 0, level: 'regular' },
      { grade: 'C', credits: Number.NaN, level: 'regular' },
      { grade: 'D', credits: -1, level: 'regular' },
    ]);
    expect(r.counted).toBe(1);
    expect(r.unweighted).toBe(4);
  });

  it('counts F as zero points with full credits', () => {
    const r = computeGpa([
      { grade: 'A', credits: 3, level: 'regular' },
      { grade: 'F', credits: 3, level: 'ap' },
    ]);
    expect(r.unweighted).toBe(2);
    expect(r.weighted).toBe(2);
  });

  it('supports fractional credits (e.g. 0.5 for a semester course)', () => {
    const r = computeGpa([
      { grade: 'A', credits: 1, level: 'regular' },
      { grade: 'B', credits: 0.5, level: 'regular' },
    ]);
    expect(r.unweighted).toBeCloseTo(5.5 / 1.5, 10);
  });

  it('returns NaN GPA for an empty list', () => {
    const r = computeGpa([]);
    expect(r.unweighted).toBeNaN();
    expect(r.weighted).toBeNaN();
    expect(r.credits).toBe(0);
  });

  it('uses the A+ option', () => {
    const r = computeGpa([{ grade: 'A+', credits: 3, level: 'regular' }], { aPlus43: true });
    expect(r.unweighted).toBe(4.3);
  });
});

describe('cumulativeGpa', () => {
  it('blends the previous GPA with this term', () => {
    // 3.2 over 45 credits + 15 credits of 3.8 (57 QP) → (144 + 57) / 60 = 3.35
    expect(cumulativeGpa(3.2, 45, 57, 15)).toBeCloseTo(3.35, 10);
  });
  it('equals the term GPA with no previous credits', () => {
    expect(cumulativeGpa(0, 0, 36, 12)).toBe(3);
  });
  it('is NaN for invalid previous values or no credits', () => {
    expect(cumulativeGpa(Number.NaN, 30, 36, 12)).toBeNaN();
    expect(cumulativeGpa(3, -1, 36, 12)).toBeNaN();
    expect(cumulativeGpa(3, 0, 0, 0)).toBeNaN();
  });
});

describe('requiredGpa', () => {
  it('finds the GPA needed on the remaining credits', () => {
    // 2.8 over 60 credits, want 3.0 after 30 more: (3.0 × 90 − 168) / 30 = 3.4
    const r = requiredGpa(2.8, 60, 3.0, 30)!;
    expect(r.required).toBeCloseTo(3.4, 10);
    expect(r.status).toBe('ok');
    expect(r.bestPossible).toBeCloseTo((168 + 120) / 90, 10);
  });

  it('reports when the target is out of reach', () => {
    // 2.5 over 90 credits, want 3.5 after 30: needs 6.5
    const r = requiredGpa(2.5, 90, 3.5, 30)!;
    expect(r.status).toBe('impossible');
    expect(r.required).toBeCloseTo(6.5, 10);
    expect(r.bestPossible).toBeCloseTo(2.875, 10);
  });

  it('reports when the target is already locked in', () => {
    expect(requiredGpa(3.9, 100, 3.0, 10)!.status).toBe('reached');
  });

  it('allows up to 5.0 on a weighted scale', () => {
    const r = requiredGpa(3.8, 20, 4.2, 20, 5)!;
    expect(r.required).toBeCloseTo(4.6, 10);
    expect(r.status).toBe('ok');
    expect(requiredGpa(3.8, 20, 4.2, 20, 4)).toBeNull(); // target above the scale
  });

  it('treats exactly 4.0 needed as possible', () => {
    expect(requiredGpa(3.0, 30, 3.5, 30)!.status).toBe('ok');
    expect(requiredGpa(3.0, 30, 3.5, 30)!.required).toBeCloseTo(4.0, 10);
  });

  it('returns null for invalid input', () => {
    expect(requiredGpa(3, 30, 3.5, 0)).toBeNull();
    expect(requiredGpa(-1, 30, 3.5, 10)).toBeNull();
    expect(requiredGpa(3, 30, Number.NaN, 10)).toBeNull();
    expect(requiredGpa(4.5, 30, 3.5, 10)).toBeNull();
  });
});

describe('roundGpa', () => {
  it('rounds half up to two decimals', () => {
    expect(roundGpa(3.345)).toBe(3.35);
    expect(roundGpa(3.3449)).toBe(3.34);
    expect(roundGpa(3)).toBe(3);
    expect(roundGpa(Number.NaN)).toBeNaN();
  });
});
