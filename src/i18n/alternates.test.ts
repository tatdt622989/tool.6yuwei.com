import { describe, expect, it } from 'vitest';
import { allLocales, hreflangLinks, someLocales, switcherLinks, xDefaultLocale } from './alternates';
import { localeFromTag, localeHome, localePath, splitLocale } from './locales';

const abs = (path: string) => `https://example.com${path}`;

describe('locale paths', () => {
  it('prefixes non-default locales only', () => {
    expect(localePath('zh-TW', '/bmi-calculator/')).toBe('/bmi-calculator/');
    expect(localePath('en', '/bmi-calculator/')).toBe('/en/bmi-calculator/');
    expect(localePath('ja', '/')).toBe('/ja/');
    expect(localeHome('zh-TW')).toBe('/');
  });

  it('rejects relative paths', () => {
    expect(() => localePath('en', 'about/')).toThrow();
  });

  it('splits a pathname into locale + base path', () => {
    expect(splitLocale('/en/word-counter/')).toEqual({ locale: 'en', path: '/word-counter/' });
    expect(splitLocale('/ja/')).toEqual({ locale: 'ja', path: '/' });
    expect(splitLocale('/ja')).toEqual({ locale: 'ja', path: '/' });
    expect(splitLocale('/word-counter/')).toEqual({ locale: 'zh-TW', path: '/word-counter/' });
    // A zh slug that merely starts with "en" is not the en locale.
    expect(splitLocale('/english-test/')).toEqual({ locale: 'zh-TW', path: '/english-test/' });
  });

  it('maps html lang tags back to locales', () => {
    expect(localeFromTag('zh-Hant-TW')).toBe('zh-TW');
    expect(localeFromTag('en')).toBe('en');
    expect(localeFromTag('ja-JP')).toBe('ja');
    expect(localeFromTag(undefined)).toBe('zh-TW');
  });
});

describe('hreflangLinks', () => {
  it('lists every locale plus x-default → zh-TW for a page in all locales', () => {
    expect(hreflangLinks(allLocales('/about/'), abs)).toEqual([
      { hreflang: 'zh-TW', href: 'https://example.com/about/' },
      { hreflang: 'en', href: 'https://example.com/en/about/' },
      { hreflang: 'ja', href: 'https://example.com/ja/about/' },
      { hreflang: 'x-default', href: 'https://example.com/about/' },
    ]);
  });

  it('zh-only page: only itself and x-default', () => {
    expect(hreflangLinks({ 'zh-TW': '/salary-calculator/' }, abs)).toEqual([
      { hreflang: 'zh-TW', href: 'https://example.com/salary-calculator/' },
      { hreflang: 'x-default', href: 'https://example.com/salary-calculator/' },
    ]);
  });

  it('x-default falls back to en when there is no zh-TW page', () => {
    const alts = someLocales('/tip-calculator/', ['en', 'ja']);
    expect(xDefaultLocale(alts)).toBe('en');
    expect(hreflangLinks(alts, abs).at(-1)).toEqual({ hreflang: 'x-default', href: 'https://example.com/en/tip-calculator/' });
  });

  it('x-default for a ja-only page is the ja page', () => {
    const alts = someLocales('/wareki/', ['ja']);
    expect(hreflangLinks(alts, abs)).toEqual([
      { hreflang: 'ja', href: 'https://example.com/ja/wareki/' },
      { hreflang: 'x-default', href: 'https://example.com/ja/wareki/' },
    ]);
  });

  it('is empty when there are no alternates', () => {
    expect(hreflangLinks({}, abs)).toEqual([]);
  });
});

describe('switcherLinks', () => {
  it('links to the same page where it exists, else to that locale home', () => {
    const links = switcherLinks('zh-TW', { 'zh-TW': '/invoice-lottery/' });
    expect(links.map((l) => [l.locale, l.href, l.samePage, l.current])).toEqual([
      ['zh-TW', '/invoice-lottery/', true, true],
      ['en', '/en/', false, false],
      ['ja', '/ja/', false, false],
    ]);
  });

  it('uses localized labels and hreflang values', () => {
    const links = switcherLinks('ja', allLocales('/'));
    expect(links.map((l) => l.label)).toEqual(['中文', 'English', '日本語']);
    expect(links.map((l) => l.hreflang)).toEqual(['zh-TW', 'en', 'ja']);
    expect(links.find((l) => l.current)?.locale).toBe('ja');
  });
});
