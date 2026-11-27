import type { APIRoute } from 'astro';
import { ads } from '../config/site';

// Google's certification authority id for AdSense is fixed: f08c47fec0942fa0.
export const GET: APIRoute = () => {
  const publisher = ads.client.replace(/^ca-/, '');
  const body = publisher ? `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n` : '# AdSense publisher id not configured\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
