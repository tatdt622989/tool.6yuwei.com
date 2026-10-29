// GPA calculator (US 4.0 scale). Pure functions.
//
// Letter grade → grade points, the common plus/minus mapping used by many US registrars, e.g.
// Pepperdine University Registrar, "Definition of Grade Points"
//   (https://www.pepperdine.edu/registrar/grades/pointdefinition.htm): A 4.0, A- 3.7, B+ 3.3, B 3.0, B- 2.7,
//   C+ 2.3, C 2.0, C- 1.7, D+ 1.3, D 1.0, D- 0.7, F 0.0.
// Indiana University Kokomo grading policies use the same values (A+ = 4.0). Some schools give A+ 4.3 or omit
// A+/D-; the UI offers an A+ = 4.3 option.
// College Board BigFuture, "How to Convert Your GPA to a 4.0 Scale": schools may weight honors/AP classes; a
// common high-school convention is +0.5 for honors and +1.0 for AP/IB/dual enrollment (5.0 max). Colleges
// often recalculate. F earns no weighting bonus.

export const GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'] as const;
export type Grade = (typeof GRADES)[number];

const POINTS: Record<Grade, number> = {
  'A+': 4.0,
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  'D+': 1.3,
  D: 1.0,
  'D-': 0.7,
  F: 0,
};

export type CourseLevel = 'regular' | 'honors' | 'ap';
export const LEVEL_BONUS: Record<CourseLevel, number> = { regular: 0, honors: 0.5, ap: 1.0 };

export interface ScaleOptions {
  /** Count A+ as 4.3 instead of 4.0. */
  aPlus43?: boolean;
}

export function isGrade(value: string): value is Grade {
  return (GRADES as readonly string[]).includes(value);
}

export function gradePoints(grade: Grade, options: ScaleOptions = {}): number {
  if (grade === 'A+' && options.aPlus43) return 4.3;
  return POINTS[grade];
}

/** Grade points after the honors/AP bonus. Failing grades get no bonus. */
export function weightedPoints(grade: Grade, level: CourseLevel, options: ScaleOptions = {}): number {
  const base = gradePoints(grade, options);
  return grade === 'F' ? base : base + LEVEL_BONUS[level];
}

export interface Course {
  grade: Grade | '';
  credits: number;
  level: CourseLevel;
}

export interface GpaResult {
  /** NaN when no course counts. */
  unweighted: number;
  weighted: number;
  credits: number;
  qualityPoints: number;
  weightedQualityPoints: number;
  /** Courses that were counted (grade chosen and credits > 0). */
  counted: number;
}

export function isValidCredits(credits: number): boolean {
  return Number.isFinite(credits) && credits > 0 && credits <= 100;
}

export function computeGpa(courses: readonly Course[], options: ScaleOptions = {}): GpaResult {
  let credits = 0;
  let qp = 0;
  let wqp = 0;
  let counted = 0;
  for (const c of courses) {
    if (!c.grade || !isGrade(c.grade) || !isValidCredits(c.credits)) continue;
    credits += c.credits;
    qp += gradePoints(c.grade, options) * c.credits;
    wqp += weightedPoints(c.grade, c.level, options) * c.credits;
    counted++;
  }
  return {
    unweighted: credits > 0 ? qp / credits : Number.NaN,
    weighted: credits > 0 ? wqp / credits : Number.NaN,
    credits,
    qualityPoints: qp,
    weightedQualityPoints: wqp,
    counted,
  };
}

/** Cumulative GPA from a previous GPA/credits and this term's quality points/credits. */
export function cumulativeGpa(prevGpa: number, prevCredits: number, termPoints: number, termCredits: number): number {
  if (!Number.isFinite(prevGpa) || !Number.isFinite(prevCredits) || prevCredits < 0 || prevGpa < 0) return Number.NaN;
  const totalCredits = prevCredits + termCredits;
  if (!(totalCredits > 0)) return Number.NaN;
  return (prevGpa * prevCredits + termPoints) / totalCredits;
}

export type TargetStatus = 'ok' | 'reached' | 'impossible';

export interface TargetResult {
  /** GPA needed on the remaining credits. */
  required: number;
  status: TargetStatus;
  /** Best cumulative GPA reachable with straight A's (maxPoints) on the remaining credits. */
  bestPossible: number;
}

/**
 * "What GPA do I need": the average needed over `remainingCredits` to finish with `target` cumulative GPA.
 * `maxPoints` is the highest grade point a course can earn (4.0 unweighted, 5.0 weighted).
 */
export function requiredGpa(
  currentGpa: number,
  currentCredits: number,
  target: number,
  remainingCredits: number,
  maxPoints = 4,
): TargetResult | null {
  if (![currentGpa, currentCredits, target, remainingCredits].every(Number.isFinite)) return null;
  if (currentGpa < 0 || currentCredits < 0 || target < 0 || remainingCredits <= 0) return null;
  if (currentGpa > maxPoints || target > maxPoints) return null;
  const total = currentCredits + remainingCredits;
  const required = (target * total - currentGpa * currentCredits) / remainingCredits;
  const bestPossible = (currentGpa * currentCredits + maxPoints * remainingCredits) / total;
  const status: TargetStatus = required <= 0 ? 'reached' : required > maxPoints + 1e-9 ? 'impossible' : 'ok';
  return { required, status, bestPossible };
}

/** GPAs are reported truncated or rounded to 2 decimals; we round half up like most transcripts. */
export function roundGpa(gpa: number, digits = 2): number {
  if (!Number.isFinite(gpa)) return Number.NaN;
  const f = 10 ** digits;
  return Math.round(gpa * f + 1e-9) / f;
}

/** Typical percentage cutoffs (90/80/70/60, ±3 for plus/minus). Schools vary; used only for the reference table. */
export const PERCENT_RANGES: Record<Grade, string> = {
  'A+': '97–100',
  A: '93–96',
  'A-': '90–92',
  'B+': '87–89',
  B: '83–86',
  'B-': '80–82',
  'C+': '77–79',
  C: '73–76',
  'C-': '70–72',
  'D+': '67–69',
  D: '63–66',
  'D-': '60–62',
  F: 'Below 60',
};
