import type { APIRoute } from 'astro';
import { webManifest } from '../../lib/feeds';

export const GET: APIRoute = () => webManifest('ja');
