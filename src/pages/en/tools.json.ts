import type { APIRoute } from 'astro';
import { toolsFeed } from '../../lib/feeds';

export const GET: APIRoute = () => toolsFeed('en');
