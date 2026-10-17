/**
 * Project thumbnail with its title and album. A bar with the title and album slides down over the top edge on hover or focus,
 * and the image zooms slowly.
 */

import type { CSSProperties } from 'react';
import styles from './ProjectCard.module.css';

export type ProjectCardThumbnail = {
  url: string;
  width?: number | null;
  height?: number | null;
};

export type ProjectCardProps = {
  title: string;
  album: string;
  thumbnail: ProjectCardThumbnail;
  thumbnailAlt?: string;
  href: string;
  featured?: boolean;
  style?: CSSProperties;
};

export default function ProjectCard({
  title,
  album,
  thumbnail,
  thumbnailAlt,
  href,
  featured = false,
  style,
}: ProjectCardProps) {
  /** Falls back to a 1:1 ratio when dimensions are missing so cards still reserve space and the grid stays stable on first paint. */
  const aspectRatio =
    thumbnail.width && thumbnail.height
      ? `${thumbnail.width} / ${thumbnail.height}`
      : '1 / 1';

  return (
    <article className={styles.card} data-album={album} style={style}>
      <a href={href} className={styles.link} aria-label={`View project: ${title}`}>
        <div
          className={styles.media}
          aria-hidden="true"
          style={{ aspectRatio }}
        >
          <img
            src={thumbnail.url}
            alt={thumbnailAlt || title}
            loading="lazy"
            decoding="async"
            width={thumbnail.width ?? undefined}
            height={thumbnail.height ?? undefined}
          />
        </div>

        <div className={styles.bar}>
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
