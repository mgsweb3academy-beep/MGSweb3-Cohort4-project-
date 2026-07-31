/**
 * Corridor LMS — Accessibility (A11y) Utilities Engine
 * Enforces keyboard accessibility, focus management, and screen-reader announcements (§6 Accessibility).
 */

/**
 * Announces a message to screen reader users using an ARIA live region.
 */
export function announceToScreenReader(
  message: string,
  politeness: 'polite' | 'assertive' = 'polite'
): void {
  if (typeof document === 'undefined') return;

  const liveRegionId = 'a11y-live-region';
  let liveRegion = document.getElementById(liveRegionId);

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = liveRegionId;
    liveRegion.setAttribute('aria-live', politeness);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only'; // Hidden visually but read by screen readers
    document.body.appendChild(liveRegion);
  } else {
    liveRegion.setAttribute('aria-live', politeness);
  }

  liveRegion.textContent = message;
}

/**
 * Key code mappings for consistent keyboard navigation handlers.
 */
export const KEY_CODES = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
};

/**
 * Traps focus within a container (e.g. modals, drawer menus).
 */
export function handleFocusTrap(
  event: KeyboardEvent,
  containerRef: HTMLElement | null
): void {
  if (event.key !== KEY_CODES.TAB || !containerRef) return;

  const focusables = containerRef.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );

  if (focusables.length === 0) return;

  const firstElement = focusables[0];
  const lastElement = focusables[focusables.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      lastElement.focus();
      event.preventDefault();
    }
  } else {
    if (document.activeElement === lastElement) {
      firstElement.focus();
      event.preventDefault();
    }
  }
}
