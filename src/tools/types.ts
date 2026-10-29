import type { CategoryId } from '../config/categories';
import type { Locale } from '../i18n/locales';

export interface ToolSection {
  heading: string;
  /** Paragraphs of plain text. Blank-line separated strings become separate <p>. */
  body: string[];
}

/**
 * One locale's metadata for a tool. meta.ts = zh-TW, meta.en.ts = en, meta.ja.ts = ja.
 * All files of a tool share the same slug (the folder name) and category.
 */
export interface ToolMeta {
  /** Must equal the folder name under src/tools/. Becomes the URL: /<slug>/, /en/<slug>/, /ja/<slug>/ */
  slug: string;
  /** Short display name, e.g. 「字數統計」. Used in H1, cards, breadcrumbs. */
  name: string;
  /** <title> text without the site suffix. Lead with the main search keyword. */
  seoTitle: string;
  /** Meta description, keyword-rich and natural. zh 70–160 字, en ~140–160 chars, ja ~80–120 字. */
  description: string;
  category: CategoryId;
  /** Lucide icon name (PascalCase), e.g. 'Calculator'. See https://lucide.dev/icons */
  icon: string;
  /** Search terms people actually type; used for on-site search and JSON-LD keywords. */
  keywords: string[];
  /** One or two sentences shown under the H1. */
  intro: string;
  /** Ordered usage steps. */
  howTo: string[];
  /** Explanatory long-form content (2–4 sections). Main SEO body. */
  sections: ToolSection[];
  /** 3–6 Q&As, emitted as FAQPage structured data. */
  faq: { q: string; a: string }[];
  /** Slugs of other tools to link to. Same-category tools are added automatically. */
  related?: string[];
  /** Blog posts that discuss this tool (bidirectional linking with blog.6yuwei.com). */
  blogPosts?: { title: string; url: string }[];
  /** Higher shows earlier on the home page. Default 0. */
  priority?: number;
  /** ISO date the tool was last meaningfully updated (sitemap / JSON-LD). */
  updated: string;
}

export function defineTool(meta: ToolMeta): ToolMeta {
  return meta;
}

/** A ToolMeta as served by the registry: tagged with the locale it belongs to. */
export interface LocalizedTool extends ToolMeta {
  locale: Locale;
}
