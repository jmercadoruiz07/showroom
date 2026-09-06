/*
|-------------------------------------------------------------------------------
| ProjectCard — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| Single project thumbnail with title + album. No border-radius, no default drop shadow.
| Title overlay on hover (slides up from bottom). Slow zoom (scale 1.03 over 500ms).
| Album tag in Mono font (top-right).
|
*/
import type { CSSProperties } from 'react';
import './ProjectCard.css';

export interface ProjectCardThumbnail {
  url: string;
  width?: number | null;
  height?: number | null;
}

export interface ProjectCardProps {
  title: string;
  album: string;
  thumbnail: ProjectCardThumbnail;
  thumbnailAlt?: string;
  href: string;
  featured?: boolean;
  className?: string;
  style?: CSSProperties;
}

export default function ProjectCard({
  title,
  album,
  thumbnail,
  thumbnailAlt,
  href,
  featured = false,
  className,
  style,
}: ProjectCardProps) {
  const cardClass = ['project-card', 'reveal-item', className]
    .filter(Boolean)
    .join(' ');

  // Falls back to a 1:1 ratio when dimensions are missing so cards still
  // reserve space and the grid stays stable on first paint.
  const aspectRatio =
    thumbnail.width && thumbnail.height
      ? `${thumbnail.width} / ${thumbnail.height}`
      : '1 / 1';

  return (
    <article className={cardClass} data-album={album} style={style}>
      <a href={href} className="card-link" aria-label={`View project: ${title}`}>
        <div
          className="card-media"
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

        <div className="card-overlay">
          {album ? (
            <span className="card-category text-mono" aria-hidden="true">
              {album.toUpperCase()}
            </span>
          ) : <div />}

          <div className="card-content">
            <h2 className="card-title text-display">{title}</h2>
            {featured && <span className="card-featured text-mono">FEATURED</span>}
          </div>
        </div>
      </a>
    </article>
  );
}
