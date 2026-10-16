/*
|-------------------------------------------------------------------------------
| FeaturedAccordionItem — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| Full-width project strip. Shows the thumbnail cropped to a short band with
| the title and album over it; on hover or keyboard focus the strip grows to
| a fixed height. Takes the same props as ProjectCard.
|
*/
import type { ProjectCardProps } from '../ProjectCard/ProjectCard';
import styles from './FeaturedAccordionItem.module.css';

export default function FeaturedAccordionItem({
  title,
  album,
  thumbnail,
  thumbnailAlt,
  href,
  featured = false,
  style,
}: ProjectCardProps) {
  return (
    <article className={styles.item} data-album={album} style={style}>
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
