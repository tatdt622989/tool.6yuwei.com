import type { APIRoute } from 'astro';
import { getCategory } from '../config/categories';
import { absoluteUrl } from '../config/site';
import { toolPath, tools } from '../tools/registry';

// Public feed consumed by blog.6yuwei.com to render "related tool" cards.
export const GET: APIRoute = () => {
  const body = tools.map((t) => ({
    slug: t.slug,
    name: t.name,
    title: t.seoTitle,
    description: t.description,
    intro: t.intro,
    category: getCategory(t.category).name,
    keywords: t.keywords,
    url: absoluteUrl(toolPath(t.slug)),
  }));
  return new Response(JSON.stringify({ updated: new Date().toISOString(), tools: body }, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
