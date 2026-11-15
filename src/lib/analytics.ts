// GA4 custom events for tool usage. Browser-only; safe to call anywhere.
//
// BaseLayout loads gtag only on the production host, so on dev and preview servers
// window.gtag is undefined and track() is a no-op (it logs to the console in dev).
//
// Every event carries tool_id and tool_locale, read from the [data-tool-id] wrapper
// that ToolView and the convert pages put around the tool UI. Traffic source is not
// sent as a parameter: GA4 attaches session source / medium / campaign to every
// event, and BaseLayout keeps utm_* in page_location so Shorts short links count.
//
// Events (register tool_id, tool_locale, interaction, method as event-scoped custom
// dimensions in GA4 to break reports down by them):
//   tool_use       first real interaction with the tool on this page view (once)
//   tool_copy      a result was copied
//   tool_download  a file was saved
//   share          GA4 recommended event; method = native | copy_link | line | ...

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** The tool on this page, or null on pages without one. */
export function currentTool(): { id: string; locale: string } | null {
  const el = document.querySelector<HTMLElement>('[data-tool-id]');
  if (!el?.dataset.toolId) return null;
  return {
    id: el.dataset.toolId,
    locale: el.dataset.toolLocale ?? document.documentElement.lang,
  };
}

export function track(name: string, params: Params = {}): void {
  const tool = currentTool();
  const payload: Params = tool ? { tool_id: tool.id, tool_locale: tool.locale, ...params } : params;
  if (import.meta.env.DEV) console.debug('[analytics]', name, payload);
  try {
    window.gtag?.('event', name, payload);
  } catch {
    /* analytics must never break a tool */
  }
}

/** File extension of a download name, lower-cased, without the dot. */
export function fileExtension(filename: string): string | undefined {
  const match = /\.([a-z0-9]{1,8})$/i.exec(filename);
  return match ? match[1].toLowerCase() : undefined;
}

let used = false;

/**
 * Delegated listeners on the tool wrapper so all tools report tool_use without
 * per-tool code. Most tools compute live on input, so the first input, change,
 * button press or file drop counts as use; page loads, focus and scrolling do not.
 * Installed once by BaseLayout.
 */
export function installToolTracking(): void {
  const root = document.querySelector<HTMLElement>('[data-tool-id]');
  if (!root) return;

  const markUsed = (interaction: string) => {
    if (used) return;
    used = true;
    track('tool_use', { interaction });
  };

  root.addEventListener('input', () => markUsed('input'), true);
  root.addEventListener(
    'change',
    (event) => markUsed((event.target as HTMLInputElement | null)?.type === 'file' ? 'file' : 'input'),
    true,
  );
  root.addEventListener('drop', () => markUsed('file'), true);
  root.addEventListener(
    'click',
    (event) => {
      const target = (event.target as Element | null)?.closest('button, [role="button"], a[download], summary');
      if (!target || !root.contains(target)) return;
      markUsed('click');
      // Plain <a download> links (e.g. a pre-built data: or blob: URL) bypass downloadBlob.
      if (target instanceof HTMLAnchorElement && target.hasAttribute('download')) {
        track('tool_download', {
          file_extension: fileExtension(target.download),
        });
      }
    },
    true,
  );
  // Keyboard-only tools (typing test, keyboard tester, CPS test) never fire input.
  root.addEventListener('keydown', (event) => {
    if (!event.repeat) markUsed('key');
  });
}
