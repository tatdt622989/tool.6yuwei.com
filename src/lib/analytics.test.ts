import { describe, expect, it } from 'vitest';
import { fileExtension } from './analytics';

describe('fileExtension', () => {
  it('returns the lower-cased extension', () => {
    expect(fileExtension('photo.JPG')).toBe('jpg');
    expect(fileExtension('merged.pdf')).toBe('pdf');
    expect(fileExtension('art-2026.11.14.png')).toBe('png');
  });
  it('is undefined without an extension', () => {
    expect(fileExtension('README')).toBeUndefined();
    expect(fileExtension('')).toBeUndefined();
  });
});
