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

export interface ProjectCardProps {
  title: string;
  album: string;
  thumbnail: string;
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

  return (
    <article className={cardClass} data-album={album} style={style}>
      <a href={href} className="card-link" aria-label={`View project: ${title}`}>
        <div className="card-media" aria-hidden="true">
          <img
            src={thumbnail}
            alt={thumbnailAlt || title}
            loading="lazy"
            decoding="async"
            width="400"
            height="500"
          />
        </div>

        <div className="card-overlay">
          <span className="card-category text-mono" aria-hidden="true">
            {album.toUpperCase()}
          </span>

          <div className="card-content">
            <h2 className="card-title text-display">{title}</h2>
            {featured && <span className="card-featured text-mono">FEATURED</span>}
          </div>
        </div>
      </a>
    </article>
  );
}
