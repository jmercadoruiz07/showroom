/*
|-------------------------------------------------------------------------------
| ProjectMedia — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| Scrollable image gallery + lightbox overlay for a single project.
| Dark backdrop, image scales to fit viewport, keyboard navigation
| (Escape, arrows), click-to-close, focus returns to the trigger.
|
*/
import { useEffect, useRef, useState } from 'react';
import './ProjectMedia.css';

interface ProjectMediaProps {
  images: string[];
  title: string;
}

const focusableSelector =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ProjectMedia({ images, title }: ProjectMediaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const viewerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const total = images.length;

  const open = (index: number, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const prev = () => setCurrentIndex((index) => (index - 1 + total) % total);
  const next = () => setCurrentIndex((index) => (index + 1) % total);

  useEffect(() => {
    if (!isOpen) return;
    const viewer = viewerRef.current;
    if (!viewer) return;

    const getFocusable = () =>
      Array.from(viewer.querySelectorAll(focusableSelector)) as HTMLElement[];

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key === 'ArrowLeft') {
        prev();
        return;
      }
      if (e.key === 'ArrowRight') {
        next();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = getFocusable();
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, total]);

  useEffect(() => {
    if (isOpen) return;
    if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
      triggerRef.current.focus();
    }
  }, [isOpen]);

  return (
    <>
      <div className="image-gallery">
        {images.map((image, index) => (
          <figure
            key={`${image}-${index}`}
            className="gallery-item"
            data-index={index}
            tabIndex={0}
            role="button"
            aria-label={`Open image ${index + 1} in viewer`}
            onClick={(e) => open(index, e.currentTarget)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open(index, e.currentTarget);
              }
            }}
          >
            <img
              src={image}
              alt={`${title} - Image ${index + 1}`}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              width="800"
              height="600"
            />
          </figure>
        ))}
      </div>

      <div
        ref={viewerRef}
        className={`media-viewer${isOpen ? ' is-open' : ''}`}
        id="media-viewer"
        role="dialog"
        aria-label={`${title} image viewer`}
        aria-hidden={!isOpen}
      >
        <div className="viewer-backdrop" aria-hidden="true" onClick={close} />

        <button
          ref={closeButtonRef}
          className="viewer-close"
          aria-label="Close viewer"
          type="button"
          onClick={close}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <button className="viewer-nav viewer-prev" aria-label="Previous image" type="button" onClick={prev}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <button className="viewer-nav viewer-next" aria-label="Next image" type="button" onClick={next}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        <div className="viewer-content">
          <img
            className="viewer-image"
            src={isOpen ? images[currentIndex] : undefined}
            alt={isOpen ? `${title} - Image ${currentIndex + 1}` : ''}
          />
        </div>

        <div className="viewer-counter text-mono">
          <span className="viewer-current">{currentIndex + 1}</span> /{' '}
          <span className="viewer-total">{total}</span>
        </div>
      </div>
    </>
  );
}
