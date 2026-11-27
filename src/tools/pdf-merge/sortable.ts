// Pointer-based drag reordering for a vertical list. Works with mouse, pen and
// touch (the handle needs `touch-action: none`). Keyboard and screen-reader
// users get explicit up / down buttons from the tool itself.

import { dropIndex, shiftFor, type Band } from './logic';

export interface SortableOptions {
  list: HTMLElement;
  /** Selector for the drag handle inside each list item. */
  handle: string;
  onMove: (from: number, to: number) => void;
}

const EDGE = 56;

export function makeSortable({ list, handle, onMove }: SortableOptions): void {
  list.addEventListener('pointerdown', (event) => {
    const grip = (event.target as Element | null)?.closest<HTMLElement>(handle);
    if (!grip || !list.contains(grip) || event.button !== 0) return;
    const items = Array.from(list.children) as HTMLElement[];
    const item = items.find((el) => el.contains(grip));
    if (!item || items.length < 2) return;
    event.preventDefault();

    const from = items.indexOf(item);
    // Document coordinates, so scrolling during the drag keeps the maths right.
    const bands: Band[] = items.map((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top + window.scrollY, height: r.height };
    });
    const gap = bands.length > 1 ? Math.max(0, bands[1].top - (bands[0].top + bands[0].height)) : 0;
    const shift = bands[from].height + gap;
    const startY = event.clientY + window.scrollY;
    let to = from;
    let lastClientY = event.clientY;
    let frame = 0;

    grip.setPointerCapture(event.pointerId);
    list.classList.add('is-sorting');
    item.classList.add('is-dragging');

    const update = () => {
      const dy = lastClientY + window.scrollY - startY;
      item.style.transform = `translateY(${dy}px)`;
      to = dropIndex(bands, from, dy);
      items.forEach((el, i) => {
        if (i === from) return;
        const off = shiftFor(i, from, to, shift);
        el.style.transform = off ? `translateY(${off}px)` : '';
      });
    };

    const autoScroll = () => {
      frame = 0;
      const speed = lastClientY < EDGE ? -12 : lastClientY > window.innerHeight - EDGE ? 12 : 0;
      if (!speed) return;
      window.scrollBy(0, speed);
      update();
      frame = requestAnimationFrame(autoScroll);
    };

    const move = (e: PointerEvent) => {
      lastClientY = e.clientY;
      update();
      if (!frame) frame = requestAnimationFrame(autoScroll);
    };

    const end = () => {
      grip.removeEventListener('pointermove', move);
      grip.removeEventListener('pointerup', end);
      grip.removeEventListener('pointercancel', end);
      if (frame) cancelAnimationFrame(frame);
      list.classList.remove('is-sorting');
      item.classList.remove('is-dragging');
      for (const el of items) el.style.transform = '';
      if (to !== from) onMove(from, to);
    };

    grip.addEventListener('pointermove', move);
    grip.addEventListener('pointerup', end);
    grip.addEventListener('pointercancel', end);
  });
}

/** Inline SVG icons used by the sortable lists (no icon font, no emoji). */
export const ICONS = {
  grip: '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><g fill="currentColor"><circle cx="7" cy="5" r="1.5"/><circle cx="13" cy="5" r="1.5"/><circle cx="7" cy="10" r="1.5"/><circle cx="13" cy="10" r="1.5"/><circle cx="7" cy="15" r="1.5"/><circle cx="13" cy="15" r="1.5"/></g></svg>',
  up: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M5 12l5-5 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  down: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  remove: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M6 6l8 8M14 6l-8 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
};
