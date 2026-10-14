import { useEffect, useRef, useState, type ReactNode } from "react";

export default function CollectionDialog({
  title, count, query, onQueryChange, onClose, children,
}: {
  title: string;
  count: number;
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  children: (requestClose: (afterClose?: () => void) => void) => ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const requestClose = (afterClose?: () => void) => {
    if (closeTimer.current !== null) return;
    setClosing(true);
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 240;
    closeTimer.current = window.setTimeout(() => {
      onClose();
      if (afterClose) window.requestAnimationFrame(afterClose);
    }, delay);
  };

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
    return () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
      document.body.style.overflow = overflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      className={`collection-dialog${closing ? " is-closing" : ""}`}
      ref={dialog}
      aria-labelledby="collection-dialog-title"
      onCancel={(event) => { event.preventDefault(); requestClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) requestClose();
      }}
    >
      <div className="collection-dialog-header">
        <div><span className="eyebrow">CLERDEV / COLLECTION ARCHIVE</span><h2 id="collection-dialog-title">{title}</h2><p>{count} items in the collection. Explore without leaving the portfolio.</p></div>
        <button className="icon-button collection-close" type="button" onClick={() => requestClose()} aria-label="Close collection">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </div>
      <label className="collection-search"><span>Search this collection</span><input type="search" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search by name, topic, or technology..." /></label>
      <div className="collection-dialog-content">{children(requestClose)}</div>
    </dialog>
  );
}
