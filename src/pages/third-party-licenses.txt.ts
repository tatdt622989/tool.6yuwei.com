// Notices for the open-source packages that ship in the browser bundles, built from the
// installed node_modules so versions and license texts always match what was deployed.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { APIRoute } from 'astro';
import { site } from '../config/site';

/** Packages whose code (or data files) is bundled into pages, plus extra license files and notes. */
const PACKAGES: { name: string; extraFiles?: string[]; note?: string }[] = [
  { name: 'astro' },
  { name: 'lucide', note: 'Icons are rendered as inline SVG at build time.' },
  { name: 'qrcode' },
  { name: 'marked' },
  { name: 'dompurify' },
  { name: 'pdf-lib' },
  {
    name: 'pdfjs-dist',
    extraFiles: ['standard_fonts/LICENSE_FOXIT', 'standard_fonts/LICENSE_LIBERATION'],
    note: 'Includes CMap files and standard fonts (Foxit and Liberation fonts under the licenses below).',
  },
  {
    name: 'heic2any',
    note:
      'heic2any bundles libheif (https://github.com/strukturag/libheif), which is licensed under the GNU LGPL-3.0: https://www.gnu.org/licenses/lgpl-3.0.txt. The complete source of this site, including how libheif is used, is available at ' +
      site.repoUrl +
      '.',
  },
  { name: 'pinyin-pro' },
  { name: 'opencc-js', extraFiles: ['LICENSES/Apache-2.0.txt'], note: 'Includes OpenCC dictionaries (Apache-2.0).' },
];

const root = join(process.cwd(), 'node_modules');

function licenseText(dir: string): string {
  const file = readdirSync(dir).find((f) => /^licen[cs]e(\.md|\.txt)?$/i.test(f));
  return file ? readFileSync(join(dir, file), 'utf8').trim() : '';
}

export const GET: APIRoute = () => {
  const parts = [
    `Third-party software notices for ${site.url}`,
    `This site's own source code is licensed under ${site.license}: ${site.repoUrl}`,
    'The packages below are redistributed in the site\'s JavaScript bundles under their own licenses.',
  ];
  for (const pkg of PACKAGES) {
    const dir = join(root, pkg.name);
    const meta = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as { version: string; license?: string };
    const block = [`${'='.repeat(72)}\n${pkg.name} ${meta.version} (${meta.license ?? 'see license text'})`];
    if (pkg.note) block.push(pkg.note);
    const text = licenseText(dir);
    if (text) block.push(text);
    for (const extra of pkg.extraFiles ?? []) block.push(`--- ${extra}\n${readFileSync(join(dir, extra), 'utf8').trim()}`);
    parts.push(block.join('\n\n'));
  }
  return new Response(parts.join('\n\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
