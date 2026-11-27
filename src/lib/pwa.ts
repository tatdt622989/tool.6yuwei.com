// PWA wiring: the install prompt only. The site is deliberately online-only (no service worker,
// no offline cache) so every visit loads fresh pages and ads.
// Elements with [data-install] are revealed only when the browser offers installation.

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function setupInstallPrompt(): void {
  let deferred: BeforeInstallPromptEvent | null = null;
  const buttons = () => Array.from(document.querySelectorAll<HTMLElement>('[data-install]'));
  document.documentElement.classList.toggle('is-standalone', isStandalone());

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    buttons().forEach((b) => (b.hidden = false));
  });

  window.addEventListener('appinstalled', () => {
    deferred = null;
    buttons().forEach((b) => (b.hidden = true));
  });

  document.addEventListener('click', async (event) => {
    const button = (event.target as Element | null)?.closest('[data-install]');
    if (!button || !deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    deferred = null;
    buttons().forEach((b) => (b.hidden = true));
  });
}
