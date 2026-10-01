import { useEffect, useRef, type ReactNode } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  onClose: () => void;
  /** id of the element that labels the dialog (used with aria-labelledby). */
  titleId: string;
  descriptionId?: string;
  children: ReactNode;
  /** Extra classes for the dialog panel (controls width). */
  panelClassName?: string;
  /**
   * Optional element to focus when the dialog opens (e.g. a form input).
   * Falls back to the first focusable element in the panel.
   */
  initialFocusRef?: { current: HTMLElement | null };
}

/**
 * Accessible dialog shell: renders a backdrop, traps Tab focus inside the
 * panel, closes on Escape, locks background scroll, and restores focus to the
 * previously focused element on close.
 */
export default function Modal({
  onClose,
  titleId,
  descriptionId,
  children,
  panelClassName = 'max-w-lg',
  initialFocusRef,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const initialFocusRefRef = useRef(initialFocusRef);
  initialFocusRefRef.current = initialFocusRef;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;

    const focusFirst = () => {
      const preferred = initialFocusRefRef.current?.current;
      if (preferred) {
        preferred.focus();
        return;
      }
      const items = panel?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (items && items.length > 0) items[0].focus();
      else panel?.focus();
    };
    focusFirst();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        // Keep this dialog's Escape from also closing overlays underneath it.
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => !element.hasAttribute('disabled'),
      );
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={`relative w-full ${panelClassName} max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 animate-slide-up sm:rounded-2xl scrollbar-thin`}
      >
        {children}
      </div>
    </div>
  );
}
