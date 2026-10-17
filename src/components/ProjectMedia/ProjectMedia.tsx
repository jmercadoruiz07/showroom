/*
|-------------------------------------------------------------------------------
| ProjectMedia — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| Scrollable gallery + lightbox overlay for a single project. Supports both
| images and embedded videos (Vimeo), in the order they are given. Dark backdrop, media scales to fit
| viewport, keyboard navigation (Escape, arrows), click-to-close, focus
| returns to the trigger.
|
*/
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import styles from './ProjectMedia.module.css';

export interface ProjectMediaImage {
  url: string;
  width?: number | null;
  height?: number | null;
}

export type ProjectMediaItem =
  | ({ type: 'image' } & ProjectMediaImage)
  | { type: 'video'; url: string; poster: ProjectMediaImage };

interface ProjectMediaProps {
  media: ProjectMediaItem[];
  title: string;
}

const SWIPE_DISTANCE_PX = 50;

const focusableSelector =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ProjectMedia({ media, title }: ProjectMediaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const viewerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const total = media.length;
  const current = media[currentIndex];

  const open = (index: number, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  // A horizontal touch drag of at least 50px, mostly sideways, moves to the neighbouring item.
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    swipeStart.current = e.pointerType === 'touch' ? { x: e.clientX, y: e.clientY } : null;
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || total < 2) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < SWIPE_DISTANCE_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0) next();
    else prev();
  };

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
      <div className={styles.gallery}>
        {media.map((item, index) => (
          <figure
            key={`${item.type}-${item.url}-${index}`}
            className={`${styles.item}${item.type === 'video' ? ` ${styles.itemVideo}` : ''}`}
            data-index={index}
            tabIndex={0}
            role="button"
            aria-label={
              item.type === 'video'
                ? `Play video ${index + 1}`
                : `Open image ${index + 1} in viewer`
            }
            onClick={(e) => open(index, e.currentTarget)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open(index, e.currentTarget);
              }
            }}
          >
            {item.type === 'video' ? (
              <>
                <img
                  src={item.poster.url}
                  alt={`${title} - Video ${index + 1}`}
                  loading="eager"
                  decoding="async"
                  width={item.poster.width ?? 800}
                  height={item.poster.height ?? 600}
                />
                <span className={styles.play} aria-hidden="true">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <polygon points="6 4 20 12 6 20 6 4"></polygon>
                  </svg>
                </span>
              </>
            ) : (
              <img
                src={item.url}
                alt={`${title} - Image ${index + 1}`}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                width={item.width ?? 800}
                height={item.height ?? 600}
              />
            )}
          </figure>
        ))}
      </div>

      <div
        ref={viewerRef}
        className={`${styles.viewer}${isOpen ? ` ${styles.isOpen}` : ''}`}
        id="media-viewer"
        role="dialog"
        aria-label={`${title} media viewer`}
        aria-hidden={!isOpen}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          swipeStart.current = null;
        }}
      >
        <div className={styles.backdrop} aria-hidden="true" onClick={close} />

        <button
          ref={closeButtonRef}
          className={styles.close}
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

        <button className={`${styles.nav} ${styles.prev}`} aria-label="Previous media" type="button" onClick={prev}>
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

        <button className={`${styles.nav} ${styles.next}`} aria-label="Next media" type="button" onClick={next}>
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

        <div className={styles.content}>
          {isOpen && current?.type === 'video' ? (
            <iframe
              className={styles.video}
              style={
                current.poster.width && current.poster.height
                  ? ({ '--video-ratio': `${current.poster.width} / ${current.poster.height}` } as CSSProperties)
                  : undefined
              }
              src={current.url}
              title={`${title} - Video ${currentIndex + 1}`}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <img
              className={styles.image}
              src={isOpen && current?.type === 'image' ? current.url : undefined}
              alt={
                isOpen && current?.type === 'image'
                  ? `${title} - Image ${currentIndex + 1}`
                  : ''
              }
              width={
                isOpen && current?.type === 'image' ? current.width ?? undefined : undefined
              }
              height={
                isOpen && current?.type === 'image' ? current.height ?? undefined : undefined
              }
            />
          )}
        </div>

        <div className={styles.counter}>
          {currentIndex + 1} /{' '}
          <span className={styles.total}>{total}</span>
        </div>
      </div>
    </>
  );
}
