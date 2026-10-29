// Tool registry. Each tool lives in src/tools/<slug>/ and declares one meta file per locale:
//   meta.ts (zh-TW, root URLs) · meta.en.ts (/en/) · meta.ja.ts (/ja/)
// A tool exists in a locale iff that file exists. Adding the folder + files is all it takes.
import { createRegistry } from './registry-core';
import type { ToolMeta } from './types';

const modules = {
  ...import.meta.glob<ToolMeta>('./*/meta.ts', { eager: true, import: 'default' }),
  ...import.meta.glob<ToolMeta>('./*/meta.en.ts', { eager: true, import: 'default' }),
  ...import.meta.glob<ToolMeta>('./*/meta.ja.ts', { eager: true, import: 'default' }),
};

const registry = createRegistry(modules);

export const {
  toolsFor,
  findTool,
  getTool,
  hasTool,
  toolLocales,
  toolsInCategory,
  populatedCategories,
  relatedTools,
  toolAlternates,
  categoryAlternates,
} = registry;

/** zh-TW tools (backward compatible). Prefer toolsFor(locale). */
export const tools = toolsFor('zh-TW');

export { categoryPath, toolPath } from './registry-core';
