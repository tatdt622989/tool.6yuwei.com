import type { APIRoute } from 'astro';
import { toolsFeed } from '../lib/feeds';

// Public feed consumed by blog.6yuwei.com to render "related tool" cards (CORS open in nginx.conf).
export const GET: APIRoute = () => toolsFeed('zh-TW');
