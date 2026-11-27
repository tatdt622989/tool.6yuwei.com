import { describe, expect, it } from 'vitest';
import { altFromFilename, base64Length, buildOutput, escapeAttribute, parseDataUri, sizeLevel } from './logic';

const PNG = 'data:image/png;base64,iVBORw0KGgo=';

describe('parseDataUri', () => {
  it('splits MIME type and payload', () => {
    expect(parseDataUri(PNG)).toEqual({ mime: 'image/png', base64: 'iVBORw0KGgo=' });
  });

  it('tolerates extra parameters and missing MIME type', () => {
    expect(parseDataUri('data:image/svg+xml;charset=utf-8;base64,PHN2Zz4=')).toEqual({
      mime: 'image/svg+xml',
      base64: 'PHN2Zz4=',
    });
    expect(parseDataUri('data:;base64,AA==')?.mime).toBe('application/octet-stream');
  });

  it('rejects non-base64 URIs', () => {
    expect(parseDataUri('data:text/plain,hello')).toBeNull();
    expect(parseDataUri('https://example.com/a.png')).toBeNull();
  });
});

describe('buildOutput', () => {
  it('produces each format', () => {
    expect(buildOutput(PNG, 'datauri')).toBe(PNG);
    expect(buildOutput(PNG, 'base64')).toBe('iVBORw0KGgo=');
    expect(buildOutput(PNG, 'css')).toBe(`background-image: url("${PNG}");`);
    expect(buildOutput(PNG, 'html', { alt: 'logo', width: 32, height: 16 })).toBe(
      `<img src="${PNG}" alt="logo" width="32" height="16">`,
    );
  });

  it('escapes alt text and omits unknown dimensions', () => {
    expect(buildOutput(PNG, 'html', { alt: 'a "b" <c>' })).toBe(`<img src="${PNG}" alt="a &quot;b&quot; &lt;c&gt;">`);
  });

  it('returns empty string for invalid input', () => {
    expect(buildOutput('nope', 'html')).toBe('');
  });
});

describe('helpers', () => {
  it('derives alt text from file names', () => {
    expect(altFromFilename('my logo.final.png')).toBe('my logo.final');
    expect(altFromFilename('icon')).toBe('icon');
  });

  it('escapes ampersands first', () => {
    expect(escapeAttribute('&quot;')).toBe('&amp;quot;');
  });

  it('computes Base64 length with padding', () => {
    expect(base64Length(0)).toBe(0);
    expect(base64Length(1)).toBe(4);
    expect(base64Length(3)).toBe(4);
    expect(base64Length(4)).toBe(8);
    expect(base64Length(3000)).toBe(4000);
  });

  it('classifies sizes', () => {
    expect(sizeLevel(2048)).toBe('small');
    expect(sizeLevel(50 * 1024)).toBe('medium');
    expect(sizeLevel(500 * 1024)).toBe('large');
    expect(sizeLevel(5 * 1024 * 1024)).toBe('huge');
  });
});
