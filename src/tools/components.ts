import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

// Each tool's interactive UI lives in src/tools/<slug>/Tool.astro.
const modules = import.meta.glob<AstroComponentFactory>('./*/Tool.astro', { eager: true, import: 'default' });

export function getToolComponent(slug: string): AstroComponentFactory {
  const component = modules[`./${slug}/Tool.astro`];
  if (!component) throw new Error(`Missing src/tools/${slug}/Tool.astro`);
  return component;
}
