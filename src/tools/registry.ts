import { categories, type CategoryId } from '../config/categories';
import type { ToolMeta } from './types';

// Each tool lives in src/tools/<slug>/ with a meta.ts default export.
// Adding a folder is all it takes to register a tool.
const modules = import.meta.glob<ToolMeta>('./*/meta.ts', { eager: true, import: 'default' });

// Top-level paths owned by other pages; a tool slug must not shadow them.
const RESERVED = new Set(['about', 'contact', 'privacy', 'terms', 'category', 'convert', 'app', '404', 'tools.json', 'sw.js']);

function load(): ToolMeta[] {
  const seen = new Set<string>();
  const categoryIds = new Set<string>(categories.map((c) => c.id));
  const list = Object.entries(modules).map(([path, meta]) => {
    const folder = path.split('/')[1];
    if (meta.slug !== folder) throw new Error(`Tool slug "${meta.slug}" must match folder "${folder}"`);
    if (RESERVED.has(meta.slug)) throw new Error(`Tool slug "${meta.slug}" is reserved`);
    if (seen.has(meta.slug)) throw new Error(`Duplicate tool slug "${meta.slug}"`);
    if (!categoryIds.has(meta.category)) throw new Error(`Tool "${meta.slug}" has unknown category "${meta.category}"`);
    seen.add(meta.slug);
    return meta;
  });
  return list.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.name.localeCompare(b.name, 'zh-Hant'));
}

export const tools: readonly ToolMeta[] = load();

export function getTool(slug: string): ToolMeta {
  const tool = tools.find((t) => t.slug === slug);
  if (!tool) throw new Error(`Unknown tool: ${slug}`);
  return tool;
}

export function toolsInCategory(id: CategoryId | string): ToolMeta[] {
  return tools.filter((t) => t.category === id);
}

/** Explicit related tools first, then same-category tools, then popular tools elsewhere. */
export function relatedTools(tool: ToolMeta, limit = 6): ToolMeta[] {
  const picked: ToolMeta[] = [];
  const add = (t: ToolMeta | undefined) => {
    if (t && t.slug !== tool.slug && !picked.includes(t) && picked.length < limit) picked.push(t);
  };
  tool.related?.forEach((slug) => add(tools.find((t) => t.slug === slug)));
  toolsInCategory(tool.category).forEach(add);
  tools.forEach(add);
  return picked;
}

export function toolPath(slug: string): string {
  return `/${slug}/`;
}
