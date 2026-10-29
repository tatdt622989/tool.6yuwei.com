import type { APIRoute } from 'astro';
import { site } from '../config/site';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      id: '/',
      name: `${site.name}｜${site.tagline}`,
      short_name: site.name,
      description: site.description,
      lang: 'zh-TW',
      start_url: '/?source=pwa',
      scope: '/',
      display: 'standalone',
      categories: ['utilities', 'productivity', 'finance'],
      background_color: '#f7f7f8',
      theme_color: '#f0522e',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
      shortcuts: [
        { name: '薪資計算機', url: '/salary-calculator/' },
        { name: '線上計算機', url: '/calculator/' },
        { name: '匯率換算', url: '/exchange-rate/' },
        { name: '2027 行事曆', url: '/holidays-2027/' },
      ].map((s) => ({ ...s, icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }] })),
    }),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
