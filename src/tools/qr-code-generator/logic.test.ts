import { describe, expect, it } from 'vitest';
import {
  buildEmail,
  buildPhone,
  buildVCard,
  buildWifi,
  colorWarning,
  contrastRatio,
  escapeVCard,
  escapeWifi,
  exceedsCapacity,
  normalizeHex,
  normalizeUrl,
  utf8Length,
  type VCardData,
} from './logic';

describe('normalizeUrl', () => {
  it('adds https to bare domains', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
    expect(normalizeUrl(' tool.6yuwei.com/qr?a=1 ')).toBe('https://tool.6yuwei.com/qr?a=1');
    expect(normalizeUrl('example.com:8080/path')).toBe('https://example.com:8080/path');
  });

  it('keeps existing schemes and plain text', () => {
    expect(normalizeUrl('http://a.tw')).toBe('http://a.tw');
    expect(normalizeUrl('line://ti/p/abc')).toBe('line://ti/p/abc');
    expect(normalizeUrl('hello world')).toBe('hello world');
    expect(normalizeUrl('')).toBe('');
  });
});

describe('buildWifi', () => {
  it('escapes special characters', () => {
    expect(escapeWifi('a;b,c:d"e\\f')).toBe('a\\;b\\,c\\:d\\"e\\\\f');
  });

  it('builds a WPA payload', () => {
    expect(buildWifi({ ssid: 'My Home', password: 'p;ss', security: 'WPA', hidden: false })).toBe(
      'WIFI:T:WPA;S:My Home;P:p\\;ss;;',
    );
  });

  it('omits the password for open networks and marks hidden ones', () => {
    expect(buildWifi({ ssid: 'Cafe', password: 'ignored', security: 'nopass', hidden: true })).toBe(
      'WIFI:T:nopass;S:Cafe;H:true;;',
    );
  });

  it('returns empty without an SSID', () => {
    expect(buildWifi({ ssid: '', password: 'x', security: 'WPA', hidden: false })).toBe('');
  });
});

describe('buildEmail and buildPhone', () => {
  it('URL-encodes subject and body', () => {
    expect(buildEmail({ to: 'a@b.tw', subject: '報名 & 詢問', body: '你好\n謝謝' })).toBe(
      'mailto:a@b.tw?subject=%E5%A0%B1%E5%90%8D%20%26%20%E8%A9%A2%E5%95%8F&body=%E4%BD%A0%E5%A5%BD%0A%E8%AC%9D%E8%AC%9D',
    );
    expect(buildEmail({ to: 'a@b.tw', subject: '', body: '' })).toBe('mailto:a@b.tw');
    expect(buildEmail({ to: ' ', subject: 'x', body: '' })).toBe('');
  });

  it('strips formatting from phone numbers', () => {
    expect(buildPhone('+886 912-345-678')).toBe('tel:+886912345678');
    expect(buildPhone('(02) 2345 6789')).toBe('tel:0223456789');
    expect(buildPhone(' + ')).toBe('');
  });
});

describe('buildVCard', () => {
  const empty: VCardData = { firstName: '', lastName: '', org: '', title: '', phone: '', email: '', url: '', address: '', note: '' };

  it('escapes RFC special characters', () => {
    expect(escapeVCard('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne');
  });

  it('builds a vCard 3.0 with CRLF line endings', () => {
    const card = buildVCard({ ...empty, firstName: '小明', lastName: '王', phone: '0912-345-678', org: '六語科技, Inc.' });
    expect(card.split('\r\n')).toEqual([
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:王;小明;;;',
      'FN:王小明',
      'ORG:六語科技\\, Inc.',
      'TEL;TYPE=CELL:0912345678',
      'END:VCARD',
    ]);
  });

  it('orders Latin names given-name first', () => {
    expect(buildVCard({ ...empty, firstName: 'Amy', lastName: 'Lin' })).toContain('FN:Amy Lin');
  });

  it('orders Japanese names family-name first, including kana-only names', () => {
    expect(buildVCard({ ...empty, firstName: '花子', lastName: '山田' })).toContain('FN:山田花子');
    expect(buildVCard({ ...empty, firstName: 'さくら', lastName: 'たなか' })).toContain('FN:たなかさくら');
  });

  it('returns empty when there is no name or organization', () => {
    expect(buildVCard({ ...empty, phone: '0912' })).toBe('');
  });
});

describe('capacity', () => {
  it('counts UTF-8 bytes', () => {
    expect(utf8Length('abc')).toBe(3);
    expect(utf8Length('中文')).toBe(6);
  });

  it('flags payloads larger than version 40 allows', () => {
    expect(exceedsCapacity('a'.repeat(1273), 'H')).toBe(false);
    expect(exceedsCapacity('a'.repeat(1274), 'H')).toBe(true);
    expect(exceedsCapacity('a'.repeat(1274), 'L')).toBe(false);
  });
});

describe('colors', () => {
  it('normalizes hex input', () => {
    expect(normalizeHex('#ABC')).toBe('#aabbcc');
    expect(normalizeHex('112233')).toBe('#112233');
    expect(normalizeHex('red')).toBeNull();
  });

  it('computes contrast and warns about unscannable combinations', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(colorWarning('#000000', '#ffffff')).toBeNull();
    expect(colorWarning('#ffffff', '#000000')).toBe('inverted');
    expect(colorWarning('#999999', '#aaaaaa')).toBe('low-contrast');
  });
});
