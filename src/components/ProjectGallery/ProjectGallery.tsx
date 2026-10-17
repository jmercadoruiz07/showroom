/**
 * Album filter bar and project grid. With `featured` the first tab is FEATURED and shows a FeaturedAccordion; otherwise the first tab is ALL.
 * When the tabs overflow the bar scrolls sideways, with an arrow at each end that has more, and choosing a tab centres it.
 * Album tabs show a masonry grid whose card placement comes from a shortest-column packer.
 */

import type { CSSProperties, MouseEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import FeaturedAccordion, { type FeaturedAccordionProject } from '../FeaturedAccordion/FeaturedAccordion';
import ProjectCard, { type ProjectCardThumbnail } from '../ProjectCard/ProjectCard';
import styles from './ProjectGallery.module.css';

export interface GalleryProject {
  title: string;
  album: string;
  thumbnail: ProjectCardThumbnail;
  thumbnailAlt?: string;
  href: string;
  featured?: boolean;
}

interface ProjectGalleryProps {
  projects: GalleryProject[];
  albums: string[];
  /** Projects for the FEATURED first tab; when omitted the first tab is ALL. */
  featured?: FeaturedAccordionProject[];
  /** Drops the header offset above the filter bar on small screens. */
  tightTop?: boolean;
  /** Keeps the filter bar pinned below the header while scrolling. */
  stickyFilter?: boolean;
}

interface Slot {
  column: number;
  rowStart: number;
  rowSpan: number;
}

export const ALL_ALBUMS = 'all';

/**
 * Card height is fully determined by the thumbnail aspect ratio at the
 * current column width. The span also covers the vertical gap below the
 * card, since the grid itself has no row-gap.
 */
function cardRowSpan(
  thumbnail: ProjectCardThumbnail,
  columnWidth: number,
  rowHeight: number,
  gap: number,
): number {
  const width = thumbnail.width || 1;
  const height = thumbnail.height || 1;
  const cardHeight = columnWidth * (height / width);
  return Math.max(1, Math.ceil((cardHeight + gap) / rowHeight));
}

/**
 * Basic shortest-column packer: place each card into the column with the
 * smallest current height, then advance that column's height by the card's
 * row-span. Reads the responsive column count from `--masonry-columns`
 * declared in ProjectGallery.module.css.
 */
function computePlacement(grid: HTMLElement, thumbnails: ProjectCardThumbnail[]): Slot[] {
  const computed = window.getComputedStyle(grid);
  const columns = Math.max(1, parseInt(computed.getPropertyValue('--masonry-columns'), 10) || 1);
  const gap = parseFloat(computed.columnGap) || 0;
  const columnWidth = (grid.clientWidth - gap * (columns - 1)) / columns;
  const rowHeight = parseFloat(computed.getPropertyValue('--masonry-row-height')) || 1;

  const columnHeights = new Array<number>(columns).fill(1);
  return thumbnails.map((thumbnail) => {
    const rowSpan = cardRowSpan(thumbnail, columnWidth, rowHeight, gap);
    let target = 0;
    for (let c = 1; c < columns; c++) {
      if (columnHeights[c] < columnHeights[target]) {
        target = c;
      }
    }
    const rowStart = columnHeights[target];
    columnHeights[target] = rowStart + rowSpan;
    return { column: target + 1, rowStart, rowSpan };
  });
}

function ArrowIcon({ direction }: { direction: 'before' | 'after' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points={direction === 'before' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
    </svg>
  );
}

export default function ProjectGallery({ projects, albums, featured, tightTop = false, stickyFilter = true }: ProjectGalleryProps) {
  const [activeAlbum, setActiveAlbum] = useState<string>(ALL_ALBUMS);
  const [gridEl, setGridEl] = useState<HTMLElement | null>(null);
  const [placement, setPlacement] = useState<Slot[]>([]);
  const filterListRef = useRef<HTMLUListElement>(null);
  const [moreBefore, setMoreBefore] = useState(false);
  const [moreAfter, setMoreAfter] = useState(false);

  useEffect(() => {
    const list = filterListRef.current;
    if (!list) return;
    const update = () => {
      setMoreBefore(list.scrollLeft > 1);
      setMoreAfter(list.scrollLeft + list.clientWidth < list.scrollWidth - 1);
    };
    update();
    list.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(list);
    return () => {
      list.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [albums]);

  const scrollFilter = useCallback((left: number) => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    filterListRef.current?.scrollBy({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, []);

  /** Moves the clicked tab to the middle of the bar; near either end it goes as far as the list allows. */
  const selectAlbum = (album: string, event: MouseEvent<HTMLButtonElement>) => {
    setActiveAlbum(album);
    const list = filterListRef.current;
    if (!list) return;
    const tab = event.currentTarget.getBoundingClientRect();
    const bar = list.getBoundingClientRect();
    scrollFilter(tab.left + tab.width / 2 - (bar.left + bar.width / 2));
  };

  /** Filter projects first, then compute placement for visible ones only */
  const visibleProjects = projects.filter(
    (p) => activeAlbum === ALL_ALBUMS || p.album === activeAlbum,
  );

  useEffect(() => {
    if (!gridEl) return;
    const recompute = () => {
      setPlacement(computePlacement(gridEl, visibleProjects.map((p) => p.thumbnail)));
    };
    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(gridEl);
    return () => observer.disconnect();
  }, [gridEl, activeAlbum, projects]);

  return (
    <div className={`${styles.root}${tightTop ? ` ${styles.tightTop}` : ''}`}>
      <div className={`${styles.filterBar}${stickyFilter ? '' : ` ${styles.filterBarStatic}`}`}>
        <nav
          className={styles.filter}
          aria-label="Filter projects by album"
          data-more-before={moreBefore || undefined}
          data-more-after={moreAfter || undefined}
        >
          <button
            type="button"
            className={`${styles.filterArrow} ${styles.arrowBefore}`}
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => scrollFilter(-(filterListRef.current?.clientWidth ?? 0) * 0.6)}
          >
            <ArrowIcon direction="before" />
          </button>
          <ul className={styles.filterList} ref={filterListRef}>
            <li>
              <button
                type="button"
                className={`${styles.filterButton}${activeAlbum === ALL_ALBUMS ? ` ${styles.isActive}` : ''}`}
                aria-pressed={activeAlbum === ALL_ALBUMS}
                aria-controls="project-grid"
                data-album={ALL_ALBUMS}
                onClick={(event) => selectAlbum(ALL_ALBUMS, event)}
              >
                {featured ? 'FEATURED' : 'ALL'}
              </button>
            </li>
            {albums.map((album) => (
              <li key={album}>
                <button
                  type="button"
                  className={`${styles.filterButton}${album === activeAlbum ? ` ${styles.isActive}` : ''}`}
                  aria-pressed={album === activeAlbum}
                  aria-controls="project-grid"
                  data-album={album}
                  onClick={(event) => selectAlbum(album, event)}
                >
                  {album.toUpperCase()}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={`${styles.filterArrow} ${styles.arrowAfter}`}
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => scrollFilter((filterListRef.current?.clientWidth ?? 0) * 0.6)}
          >
            <ArrowIcon direction="after" />
          </button>
        </nav>
      </div>

      {featured && activeAlbum === ALL_ALBUMS ? (
        <div id="project-grid" className={styles.grid} aria-label="Projects">
          <FeaturedAccordion projects={featured} />
        </div>
      ) : (
        <div
          id="project-grid"
          className={`${styles.grid} ${styles.masonry}${placement.length > 0 ? ` ${styles.isPacked}` : ''}`}
          aria-label="Projects"
          ref={setGridEl}
        >
          {visibleProjects.map((project, index) => {
            const slot = placement[index];
            const cardStyle: CSSProperties | undefined = slot
              ? {
                  gridColumn: String(slot.column),
                  gridRowStart: slot.rowStart,
                  gridRowEnd: slot.rowStart + slot.rowSpan,
                }
              : undefined;
            return (
              <ProjectCard
                key={project.href}
                title={project.title}
                album={project.album}
                thumbnail={project.thumbnail}
                thumbnailAlt={project.thumbnailAlt}
                href={project.href}
                featured={project.featured}
                style={cardStyle}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
