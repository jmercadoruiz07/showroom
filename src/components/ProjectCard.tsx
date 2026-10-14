/*
|-------------------------------------------------------------------------------
| ProjectCard — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| Simple project thumbnail linking to detail page. No overlay, no zoom animation.
| Image: 100% width, margin: 18px 0 (from original styles.css).
| Optional: project title as <p class="center"> below image.
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
  category: string;
  thumbnail: ProjectCardThumbnail;
  thumbnailAlt?: string;
  href: string;
  className?: string;
  style?: CSSProperties;
}

export default function ProjectCard({
  title,
  category,
  thumbnail,
  thumbnailAlt,
  href,
  className,
  style,
}: ProjectCardProps) {
  const cardClass = ['project-card', className].filter(Boolean).join(' ');

  // Falls back to a 1:1 ratio when dimensions are missing so cards still
  // reserve space and the grid stays stable on first paint.
  const aspectRatio =
    thumbnail.width && thumbnail.height
      ? `${thumbnail.width} / ${thumbnail.height}`
      : '1 / 1';

  return (
    <article className={cardClass} data-category={category} style={style}>
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
        <p className="card-title center">{title}</p>
      </a>
    </article>
  );
}
