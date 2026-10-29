import { describe, expect, it } from 'vitest';
import { LOCALES } from '../i18n/locales';
import { createRegistry, parseMetaPath, toolPath } from './registry-core';
import * as real from './registry';
import type { ToolMeta } from './types';

function meta(slug: string, overrides: Partial<ToolMeta> = {}): ToolMeta {
  return {
    slug,
    name: slug,
    seoTitle: slug,
    description: slug,
    category: 'calc',
    icon: 'Calculator',
    keywords: [],
    intro: '',
    howTo: [],
    sections: [],
    faq: [],
    updated: '2026-10-29',
    ...overrides,
  };
}

describe('parseMetaPath', () => {
  it('maps meta file names to locales', () => {
    expect(parseMetaPath('./bmi-calculator/meta.ts')).toEqual({ folder: 'bmi-calculator', locale: 'zh-TW' });
    expect(parseMetaPath('./bmi-calculator/meta.en.ts')).toEqual({ folder: 'bmi-calculator', locale: 'en' });
    expect(parseMetaPath('./wareki/meta.ja.ts')).toEqual({ folder: 'wareki', locale: 'ja' });
    expect(parseMetaPath('./x/meta.fr.ts')).toBeNull();
    expect(parseMetaPath('./x/logic.ts')).toBeNull();
  });
});

describe('createRegistry', () => {
  const registry = createRegistry({
    './bmi-calculator/meta.ts': meta('bmi-calculator', { name: 'BMI 計算機', priority: 80 }),
    './bmi-calculator/meta.en.ts': meta('bmi-calculator', { name: 'BMI Calculator', priority: 80 }),
    './bmi-calculator/meta.ja.ts': meta('bmi-calculator', { name: 'BMI 計算ツール', priority: 80 }),
    './salary-calculator/meta.ts': meta('salary-calculator', { category: 'finance', name: '薪資計算機' }),
    './tip-calculator/meta.en.ts': meta('tip-calculator', { name: 'Tip Calculator', related: ['salary-calculator'] }),
    './wareki/meta.ja.ts': meta('wareki', { category: 'time', name: '和暦変換' }),
    './word-counter/meta.ts': meta('word-counter', { category: 'text', name: '字數統計', priority: 100 }),
    './word-counter/meta.en.ts': meta('word-counter', { category: 'text', name: 'Word Counter', priority: 100 }),
  });

  it('a tool exists in a locale iff that meta file exists', () => {
    expect(registry.toolLocales('bmi-calculator')).toEqual(['zh-TW', 'en', 'ja']);
    expect(registry.toolLocales('salary-calculator')).toEqual(['zh-TW']);
    expect(registry.toolLocales('tip-calculator')).toEqual(['en']);
    expect(registry.toolLocales('wareki')).toEqual(['ja']);
    expect(registry.hasTool('salary-calculator', 'en')).toBe(false);
    expect(registry.findTool('salary-calculator', 'ja')).toBeUndefined();
  });

  it('serves the localized meta tagged with its locale', () => {
    const tool = registry.getTool('bmi-calculator', 'en');
    expect(tool.name).toBe('BMI Calculator');
    expect(tool.locale).toBe('en');
    expect(registry.getTool('bmi-calculator').locale).toBe('zh-TW');
    expect(() => registry.getTool('wareki', 'en')).toThrow(/Unknown tool/);
  });

  it('lists tools per locale, sorted by priority then name', () => {
    expect(registry.toolsFor('en').map((t) => t.slug)).toEqual(['word-counter', 'bmi-calculator', 'tip-calculator']);
    expect(registry.toolsFor('ja').map((t) => t.slug)).toEqual(['bmi-calculator', 'wareki']);
  });

  it('only shows categories that have tools in the locale', () => {
    expect(registry.populatedCategories('en').map((c) => c.id)).toEqual(['calc', 'text']);
    expect(registry.populatedCategories('ja').map((c) => c.id)).toEqual(['calc', 'time']);
    expect(registry.populatedCategories('en')[0].name).toBe('Calculators');
  });

  it('keeps related tools inside the same locale', () => {
    const tip = registry.getTool('tip-calculator', 'en');
    const related = registry.relatedTools(tip).map((t) => `${t.locale}:${t.slug}`);
    expect(related).not.toContain('zh-TW:salary-calculator');
    expect(related.every((r) => r.startsWith('en:'))).toBe(true);
  });

  it('builds alternates only for locales where the page exists', () => {
    expect(registry.toolAlternates('bmi-calculator')).toEqual({
      'zh-TW': '/bmi-calculator/',
      en: '/en/bmi-calculator/',
      ja: '/ja/bmi-calculator/',
    });
    expect(registry.toolAlternates('salary-calculator')).toEqual({ 'zh-TW': '/salary-calculator/' });
    expect(registry.toolAlternates('tip-calculator')).toEqual({ en: '/en/tip-calculator/' });
    expect(registry.categoryAlternates('time')).toEqual({ ja: '/ja/category/time/' });
    expect(registry.categoryAlternates('finance')).toEqual({ 'zh-TW': '/category/finance/' });
  });

  it('rejects inconsistent metas', () => {
    expect(() => createRegistry({ './a/meta.en.ts': meta('b') })).toThrow(/must match folder/);
    expect(() => createRegistry({ './en/meta.ts': meta('en') })).toThrow(/reserved/);
    expect(() => createRegistry({ './a/meta.ts': meta('a', { category: 'nope' as never }) })).toThrow(/unknown category/);
    expect(() =>
      createRegistry({
        './a/meta.ts': meta('a', { category: 'calc' }),
        './a/meta.ja.ts': meta('a', { category: 'time' }),
      }),
    ).toThrow(/same category/);
    expect(() => createRegistry({ './a/meta.de.ts': meta('a') })).toThrow(/Unexpected tool meta file/);
  });

  it('builds locale paths', () => {
    expect(toolPath('bmi-calculator')).toBe('/bmi-calculator/');
    expect(toolPath('bmi-calculator', 'ja')).toBe('/ja/bmi-calculator/');
  });
});

describe('real registry', () => {
  // Per-tool dictionaries; every tool that exists in more than one locale must have one covering each of them.
  const dicts = import.meta.glob<Record<string, unknown>>('./*/i18n.ts', { eager: true, import: 'default' });

  it('keeps every zh-TW tool (existing URLs must not disappear)', () => {
    expect(real.tools.length).toBeGreaterThanOrEqual(89);
    expect(real.hasTool('salary-calculator', 'zh-TW')).toBe(true);
  });

  it('has the reference migrations in all three locales', () => {
    for (const slug of ['word-counter', 'bmi-calculator', 'password-generator']) {
      expect(real.toolLocales(slug)).toEqual([...LOCALES]);
    }
  });

  it('multi-locale tools ship an i18n.ts with strings for each of their locales', () => {
    const slugs = new Set(LOCALES.flatMap((l) => real.toolsFor(l).map((t) => t.slug)));
    for (const slug of slugs) {
      const locales = real.toolLocales(slug);
      if (locales.length < 2) continue;
      const dict = dicts[`./${slug}/i18n.ts`];
      expect(dict, `src/tools/${slug}/i18n.ts is missing`).toBeDefined();
      for (const locale of locales) expect(dict![locale], `${slug}/i18n.ts has no "${locale}" entry`).toBeDefined();
    }
  });

  it('localized metas keep the same icon as zh-TW', () => {
    for (const tool of [...real.toolsFor('en'), ...real.toolsFor('ja')]) {
      const zh = real.findTool(tool.slug, 'zh-TW');
      if (zh) expect(tool.icon, tool.slug).toBe(zh.icon);
    }
  });
});
