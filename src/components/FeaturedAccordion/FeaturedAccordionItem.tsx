/*
|-------------------------------------------------------------------------------
| FeaturedAccordionItem — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| Full-width project strip. Shows the thumbnail cropped to a short band with
| the title and album over it; on hover or keyboard focus the strip grows to
| a fixed height. Takes the same props as ProjectCard, plus `expanded` to open
| it without hover (FeaturedAccordion drives it from the scroll position where
| there is no hover). Below 768px every strip is always open, and a strip
| only steps through its images while more than half of it is in view. While
| the strip is open it steps through
| the project's `images` every 1.2 seconds, starting from `imageIndex`, with a
| crossfade; it returns to `imageIndex` once the strip has closed again.
|
*/
import { useEffect, useRef, useState } from 'react';
import type { ProjectCardProps, ProjectCardThumbnail } from '../ProjectCard/ProjectCard';
import styles from './FeaturedAccordionItem.module.css';

export interface FeaturedAccordionImages {
  /** Every image asset of the project, in ArtStation order. */
  images?: ProjectCardThumbnail[];
  /** Position in `images` of the picture shown while the strip is closed. */
  imageIndex?: number;
}

interface FeaturedAccordionItemProps extends ProjectCardProps, FeaturedAccordionImages {
  expanded?: boolean;
}

const ROTATE_INTERVAL_MS = 1200;
// Longer than the strip's closing transition, so the picture does not change while it shrinks.
const RESET_DELAY_MS = 600;
const FINE_HOVER_QUERY = '(hover: hover) and (pointer: fine)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const MOBILE_QUERY = '(max-width: 767px)';

export default function FeaturedAccordionItem({
  title,
  album,
  thumbnail,
  thumbnailAlt,
  href,
  featured = false,
  style,
  images,
  imageIndex = 0,
  expanded = false,
}: FeaturedAccordionItemProps) {
  const slides = images && images.length > 0 ? images : [thumbnail];
  const startIndex = imageIndex < slides.length ? imageIndex : 0;
  const [index, setIndex] = useState(startIndex);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visited, setVisited] = useState<number[]>([startIndex]);

  const itemRef = useRef<HTMLElement>(null);
  const [canHover, setCanHover] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mostlyInView, setMostlyInView] = useState(false);

  useEffect(() => {
    const queries = [
      [window.matchMedia(FINE_HOVER_QUERY), setCanHover],
      [window.matchMedia(REDUCED_MOTION_QUERY), setReducedMotion],
      [window.matchMedia(MOBILE_QUERY), setIsMobile],
    ] as const;
    const update = () => queries.forEach(([query, set]) => set(query.matches));
    update();
    queries.forEach(([query]) => query.addEventListener('change', update));
    return () => queries.forEach(([query]) => query.removeEventListener('change', update));
  }, []);

  useEffect(() => {
    const item = itemRef.current;
    if (!item) return;
    const observer = new IntersectionObserver(
      ([entry]) => setMostlyInView(entry.intersectionRatio >= 0.5),
      { threshold: [0, 0.5, 1] },
    );
    observer.observe(item);
    return () => observer.disconnect();
  }, []);

  // The strip is open on hover (fine pointers only), on keyboard focus, when `expanded` says so, and
  // always on mobile (where the stylesheet keeps it open too).
  const isOpen = isMobile || expanded || focused || (hovered && canHover);
  // On mobile only the strips that are mostly on screen rotate.
  const isActive = isOpen && (!isMobile || mostlyInView);
  const rotates = slides.length > 1 && !reducedMotion;
  const nextIndex = (index + 1) % slides.length;

  useEffect(() => {
    if (!isActive || !rotates) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % slides.length),
      ROTATE_INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, [isActive, rotates, slides.length]);

  useEffect(() => {
    if (isOpen || index === startIndex) return;
    const timer = window.setTimeout(() => setIndex(startIndex), RESET_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen, index, startIndex]);

  useEffect(() => {
    setVisited((seen) => (seen.includes(index) ? seen : [...seen, index]));
  }, [index]);

  // The next picture is mounted (and so fetched) while still hidden, so it can fade in when its turn comes.
  const mounted = Array.from(
    new Set([...visited, index, ...(isActive && rotates ? [nextIndex] : [])]),
  ).sort((a, b) => a - b);

  return (
    <article
      ref={itemRef}
      className={`${styles.item}${expanded ? ` ${styles.isExpanded}` : ''}`}
      data-album={album}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={(event) => setFocused(event.target.matches(':focus-visible'))}
      onBlur={() => setFocused(false)}
    >
      <a href={href} className={styles.link} aria-label={`View project: ${title}`}>
        {mounted.map((slideIndex) => {
          const slide = slides[slideIndex];
          const isCurrent = slideIndex === index;
          return (
            <img
              key={slide.url}
              className={`${styles.image}${isCurrent ? ` ${styles.isCurrent}` : ''}`}
              src={slide.url}
              alt={isCurrent ? thumbnailAlt || title : ''}
              loading={slideIndex === startIndex ? 'lazy' : 'eager'}
              decoding="async"
              width={slide.width ?? undefined}
              height={slide.height ?? undefined}
            />
          );
        })}

        <div className={styles.content}>
          <h2 className={styles.title}>{title}</h2>
          {album && (
            <span className={styles.category} aria-hidden="true">
              {album}
            </span>
          )}
        </div>

        {featured && <span className={styles.featured}>FEATURED</span>}
      </a>
    </article>
  );
}
