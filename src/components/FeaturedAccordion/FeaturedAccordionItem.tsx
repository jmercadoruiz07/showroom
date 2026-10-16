/*
|-------------------------------------------------------------------------------
| FeaturedAccordionItem — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| Full-width project strip. Shows the thumbnail cropped to a short band with
| the title and album over it; on hover or keyboard focus the strip grows to
| a fixed height. Takes the same props as ProjectCard, plus `expanded` to open
| it without hover and `onReachCenter`, called when the strip crosses the
| vertical centre of the viewport.
|
*/
import { useEffect, useRef } from 'react';
import type { ProjectCardProps } from '../ProjectCard/ProjectCard';
import styles from './FeaturedAccordionItem.module.css';

interface FeaturedAccordionItemProps extends ProjectCardProps {
  expanded?: boolean;
  onReachCenter?: () => void;
}

export default function FeaturedAccordionItem({
  title,
  album,
  thumbnail,
  thumbnailAlt,
  href,
  featured = false,
  style,
  expanded = false,
  onReachCenter,
}: FeaturedAccordionItemProps) {
  const itemRef = useRef<HTMLElement>(null);
  const hasReachCenterHandler = Boolean(onReachCenter);
  const onReachCenterRef = useRef(onReachCenter);
  onReachCenterRef.current = onReachCenter;

  useEffect(() => {
    const item = itemRef.current;
    if (!item || !hasReachCenterHandler) return;
    // A zero-height root along the viewport's vertical centre line.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onReachCenterRef.current?.();
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    observer.observe(item);
    return () => observer.disconnect();
  }, [hasReachCenterHandler]);

  return (
    <article
      ref={itemRef}
      className={`${styles.item}${expanded ? ` ${styles.isExpanded}` : ''}`}
      data-album={album}
      style={style}
    >
      <a href={href} className={styles.link} aria-label={`View project: ${title}`}>
        <img
          className={styles.image}
          src={thumbnail.url}
          alt={thumbnailAlt || title}
          loading="lazy"
          decoding="async"
          width={thumbnail.width ?? undefined}
          height={thumbnail.height ?? undefined}
        />

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
