import { describe, expect, it } from 'vitest';
import { addRotation, baseName, chunkPages, formatPageRanges, isPdf, parsePageRanges, planOutputs } from './logic';
import { crc32, createZip, dosDateTime, uniqueNames } from './zip';

describe('parsePageRanges', () => {
  it('parses single pages and ranges into a sorted unique list', () => {
    expect(parsePageRanges('1-3,5,8-10', 12)).toEqual({ pages: [1, 2, 3, 5, 8, 9, 10], errors: [] });
    expect(parsePageRanges('5, 1, 5, 2-3', 10).pages).toEqual([1, 2, 3, 5]);
  });
  it('accepts open and reversed ranges', () => {
    expect(parsePageRanges('8-', 10).pages).toEqual([8, 9, 10]);
    expect(parsePageRanges('-3', 10).pages).toEqual([1, 2, 3]);
    expect(parsePageRanges('6-4', 10).pages).toEqual([4, 5, 6]);
  });
  it('accepts full-width digits and Chinese separators', () => {
    expect(parsePageRanges('１－３、５；７～８', 10).pages).toEqual([1, 2, 3, 5, 7, 8]);
    expect(parsePageRanges('2 到 4，6', 10).pages).toEqual([2, 3, 4, 6]);
  });
  it('clamps out-of-range input and reports it', () => {
    const r = parsePageRanges('3-15,20', 10);
    expect(r.pages).toEqual([3, 4, 5, 6, 7, 8, 9, 10]);
    expect(r.errors).toHaveLength(2);
    expect(parsePageRanges('0', 5).pages).toEqual([]);
  });
  it('reports unreadable tokens and ignores empty input', () => {
    expect(parsePageRanges('abc,2', 5)).toEqual({ pages: [2], errors: ['看不懂「abc」'] });
    expect(parsePageRanges('  ', 5)).toEqual({ pages: [], errors: [] });
    expect(parsePageRanges('-', 5).errors).toHaveLength(1);
  });
  it('accepts the Japanese wave dash as a range separator', () => {
    expect(parsePageRanges('２〜４、６', 10).pages).toEqual([2, 3, 4, 6]);
  });
  it('fills localized message templates', () => {
    const ja = { unreadable: '「{token}」を読み取れません', outOfRange: '「{token}」は範囲外です（全 {count} ページ）' };
    expect(parsePageRanges('abc,12', 10, ja).errors).toEqual(['「abc」を読み取れません', '「12」は範囲外です（全 10 ページ）']);
  });
});

describe('formatPageRanges', () => {
  it('compresses consecutive runs', () => {
    expect(formatPageRanges([1, 2, 3, 5, 8, 9, 10])).toBe('1-3,5,8-10');
    expect(formatPageRanges([4, 5])).toBe('4,5');
    expect(formatPageRanges([3, 1, 2, 2])).toBe('1-3');
    expect(formatPageRanges([])).toBe('');
  });
  it('round-trips with the parser', () => {
    const pages = [1, 2, 4, 6, 7, 8, 12];
    expect(parsePageRanges(formatPageRanges(pages), 12).pages).toEqual(pages);
  });
});

describe('chunkPages', () => {
  it('splits every N pages with a shorter last group', () => {
    expect(chunkPages(7, 3)).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    expect(chunkPages(4, 1)).toEqual([[1], [2], [3], [4]]);
    expect(chunkPages(3, 10)).toEqual([[1, 2, 3]]);
  });
  it('treats invalid sizes as 1', () => {
    expect(chunkPages(2, 0)).toEqual([[1], [2]]);
    expect(chunkPages(2, Number.NaN)).toEqual([[1], [2]]);
  });
});

describe('planOutputs', () => {
  it('extracts selected pages into one file', () => {
    expect(planOutputs('extract', 10, [5, 1, 2, 3], 2, '報告.pdf')).toEqual([{ pages: [1, 2, 3, 5], filename: '報告-p1-3_5.pdf' }]);
    expect(planOutputs('extract', 10, [], 2, 'a.pdf')).toEqual([]);
  });
  it('uses a short name for long selections', () => {
    const odd = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    expect(planOutputs('extract', 20, odd, 2, 'a.pdf')[0].filename).toBe('a-extract.pdf');
  });
  it('deletes selected pages but never all of them', () => {
    expect(planOutputs('delete', 5, [2, 4], 2, 'a.pdf')).toEqual([{ pages: [1, 3, 5], filename: 'a-edited.pdf' }]);
    expect(planOutputs('delete', 2, [1, 2], 2, 'a.pdf')).toEqual([]);
    expect(planOutputs('delete', 2, [], 2, 'a.pdf')).toEqual([]);
  });
  it('splits each page with zero-padded names', () => {
    const plans = planOutputs('each', 12, [], 2, 'scan.PDF');
    expect(plans).toHaveLength(12);
    expect(plans[0]).toEqual({ pages: [1], filename: 'scan-p01.pdf' });
    expect(plans[11].filename).toBe('scan-p12.pdf');
  });
  it('splits every N pages', () => {
    expect(planOutputs('every', 5, [], 2, 'a.pdf').map((p) => p.filename)).toEqual(['a-p1-2.pdf', 'a-p3-4.pdf', 'a-p5.pdf']);
  });
  it('ignores selections outside the document', () => {
    expect(planOutputs('extract', 3, [0, 2, 9], 1, 'a.pdf')[0].pages).toEqual([2]);
  });
});

describe('helpers', () => {
  it('normalizes rotation', () => {
    expect(addRotation(270, 90)).toBe(0);
    expect(addRotation(0, -90)).toBe(270);
    expect(addRotation(90, 450)).toBe(180);
  });
  it('derives base names and detects PDFs', () => {
    expect(baseName('合約.final.pdf')).toBe('合約.final');
    expect(baseName('.pdf')).toBe('.pdf');
    expect(baseName('')).toBe('document');
    expect(isPdf('', 'x.PDF')).toBe(true);
    expect(isPdf('image/jpeg', 'x.jpg')).toBe(false);
  });
});

describe('zip', () => {
  it('computes the standard CRC-32 check value', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
    expect(crc32(new Uint8Array())).toBe(0);
  });
  it('encodes DOS date and time', () => {
    const { date, time } = dosDateTime(new Date(2026, 9, 29, 13, 45, 31));
    expect(date).toBe(((2026 - 1980) << 9) | (10 << 5) | 29);
    expect(time).toBe((13 << 11) | (45 << 5) | 15);
  });
  it('makes duplicate names unique', () => {
    expect(uniqueNames(['a.pdf', 'A.pdf', 'a.pdf', 'b'])).toEqual(['a.pdf', 'A (2).pdf', 'a (3).pdf', 'b']);
  });
  it('writes a readable archive', () => {
    const files = [
      { name: '第一頁.pdf', data: new TextEncoder().encode('hello') },
      { name: 'b.txt', data: new Uint8Array([1, 2, 3]) },
    ];
    const zip = createZip(files, new Date(2026, 0, 1));
    const view = new DataView(zip.buffer);
    expect(view.getUint32(0, true)).toBe(0x04034b50);
    const eocd = zip.length - 22;
    expect(view.getUint32(eocd, true)).toBe(0x06054b50);
    expect(view.getUint16(eocd + 10, true)).toBe(2);
    // Walk the central directory and read each file back through its local header.
    let p = view.getUint32(eocd + 16, true);
    const decoder = new TextDecoder();
    for (const file of files) {
      expect(view.getUint32(p, true)).toBe(0x02014b50);
      expect(view.getUint16(p + 8, true) & 0x0800).toBe(0x0800);
      const nameLen = view.getUint16(p + 28, true);
      expect(decoder.decode(zip.subarray(p + 46, p + 46 + nameLen))).toBe(file.name);
      const local = view.getUint32(p + 42, true);
      const size = view.getUint32(p + 20, true);
      const start = local + 30 + view.getUint16(local + 26, true);
      expect(zip.subarray(start, start + size)).toEqual(file.data);
      expect(view.getUint32(p + 16, true)).toBe(crc32(file.data));
      p += 46 + nameLen;
    }
  });
});
