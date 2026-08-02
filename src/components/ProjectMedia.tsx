/*
|-------------------------------------------------------------------------------
| ProjectMedia — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| Scrollable gallery + lightbox overlay for a single project. Supports both
| images and an embedded video (Vimeo). Dark backdrop, media scales to fit
| viewport, keyboard navigation (Escape, arrows), click-to-close, focus
| returns to the trigger.
|
*/
import { useEffect, useMemo, useRef, useState } from 'react';
import './ProjectMedia.css';

interface ProjectMediaProps {
  images: string[];
  video?: string;
  videoPoster?: string;
  title: string;
}

type MediaItem =
  | { kind: 'video'; src: string; poster?: string }
  | { kind: 'image'; src: string };

const focusableSelector =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ProjectMedia({
  images,
  video,
  videoPoster,
  title,
}: ProjectMediaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const viewerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const media = useMemo<MediaItem[]>(() => {
    const items: MediaItem[] = [];
    if (video) items.push({ kind: 'video', src: video, poster: videoPoster });
    images.forEach((src) => items.push({ kind: 'image', src }));
    return items;
  }, [video, videoPoster, images]);

  const total = media.length;
  const current = media[currentIndex];

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
        {media.map((item, index) => (
          <figure
            key={`${item.kind}-${item.src}-${index}`}
            className={`gallery-item${item.kind === 'video' ? ' gallery-item--video' : ''}`}
            data-index={index}
            tabIndex={0}
            role="button"
            aria-label={
              item.kind === 'video'
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
            {item.kind === 'video' ? (
              <>
                <img
                  src={item.poster ?? images[0]}
                  alt={`${title} - Video ${index + 1}`}
                  loading="eager"
                  decoding="async"
                  width="800"
                  height="600"
                />
                <span className="gallery-play" aria-hidden="true">
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
                src={item.src}
                alt={`${title} - Image ${index + 1}`}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                width="800"
                height="600"
              />
            )}
          </figure>
        ))}
      </div>

      <div
        ref={viewerRef}
        className={`media-viewer${isOpen ? ' is-open' : ''}`}
        id="media-viewer"
        role="dialog"
        aria-label={`${title} media viewer`}
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

        <button className="viewer-nav viewer-prev" aria-label="Previous media" type="button" onClick={prev}>
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

        <button className="viewer-nav viewer-next" aria-label="Next media" type="button" onClick={next}>
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
          {isOpen && current?.kind === 'video' ? (
            <iframe
              className="viewer-video"
              src={current.src}
              title={`${title} - Video ${currentIndex + 1}`}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <img
              className="viewer-image"
              src={isOpen && current?.kind === 'image' ? current.src : undefined}
              alt={isOpen && current?.kind === 'image' ? `${title} - Image ${currentIndex + 1}` : ''}
            />
          )}
        </div>

        <div className="viewer-counter text-mono">
          <span className="viewer-current">{currentIndex + 1}</span> /{' '}
          <span className="viewer-total">{total}</span>
        </div>
      </div>
    </>
  );
}
