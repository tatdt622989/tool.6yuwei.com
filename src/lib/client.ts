// Browser-only helpers shared by tool scripts. Import from a tool's <script>.

/** querySelector that throws instead of returning null, scoped to a root. */
export function $<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

export function $$<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

/** Briefly swap a button's label to confirm an action. */
export function flashButton(button: HTMLElement, label = '已複製', ms = 1400): void {
  const original = button.dataset.label ?? button.textContent ?? '';
  button.dataset.label = original;
  button.textContent = label;
  button.classList.add('is-done');
  window.setTimeout(() => {
    button.textContent = original;
    button.classList.remove('is-done');
  }, ms);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms = 150): (...args: A) => void {
  let timer: number | undefined;
  return (...args: A) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), ms);
  };
}

/** Read a persisted value; tools use this to remember the last options. Never throws. */
export function loadPref<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`tool:${key}`);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function savePref(key: string, value: unknown): void {
  try {
    localStorage.setItem(`tool:${key}`, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

/**
 * Global delegated handler: any element with data-copy="<selector>" copies the
 * value / text of the target when clicked. Installed once by BaseLayout.
 */
export function installCopyButtons(): void {
  document.addEventListener('click', async (event) => {
    const button = (event.target as Element | null)?.closest<HTMLElement>('[data-copy]');
    if (!button) return;
    const target = document.querySelector<HTMLElement>(button.dataset.copy ?? '');
    if (!target) return;
    const text =
      target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement ? target.value : target.innerText;
    if (!text) return;
    if (await copyText(text)) flashButton(button);
  });
}
