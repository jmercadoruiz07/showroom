/*
|-------------------------------------------------------------------------------
| ProjectGallery — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| Horizontal pill/tag filter (sticky below header) + masonry grid of project
| cards. Each card's grid placement (column + row-start + row-span) is
| computed by a basic shortest-column packer so the browser renders the
| intended layout without relying on its dense-flow heuristics. Toggles
| visibility client-side via React state, no re-render of full list needed.
|
*/
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import ProjectCard, { type ProjectCardThumbnail } from './ProjectCard';
import './ProjectGallery.css';

export interface GalleryProject {
  title: string;
  album: string;
  thumbnail: ProjectCardThumbnail;
  thumbnailAlt?: string;
  href: string;
  featured?: boolean;
}

export const ALL_ALBUMS = 'all';

interface ProjectGalleryProps {
  projects: GalleryProject[];
  albums: string[];
}

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

interface Slot {
  column: number;
  rowStart: number;
  rowSpan: number;
}

/**
 * Basic shortest-column packer: place each card into the column with the
 * smallest current height, then advance that column's height by the card's
 * row-span. Reads the responsive column count from `--masonry-columns`
 * declared in ProjectGallery.css.
 */
function computePlacement(grid: HTMLElement, thumbnails: ProjectCardThumbnail[]): Slot[] {
  const styles = window.getComputedStyle(grid);
  const columns = Math.max(1, parseInt(styles.getPropertyValue('--masonry-columns'), 10) || 1);
  const gap = parseFloat(styles.columnGap) || 0;
  const columnWidth = (grid.clientWidth - gap * (columns - 1)) / columns;
  const rowHeight = parseFloat(styles.getPropertyValue('--masonry-row-height')) || 1;

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

export default function ProjectGallery({ projects, albums }: ProjectGalleryProps) {
  const [activeAlbum, setActiveAlbum] = useState<string>(ALL_ALBUMS);
  const [gridEl, setGridEl] = useState<HTMLElement | null>(null);
  const [placement, setPlacement] = useState<Slot[]>([]);

  // Filter projects first, then compute placement for visible ones only
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
    <div className="project-gallery">
      <div className="filter-wrapper">
        <nav className="category-filter" aria-label="Filter projects by album">
          <ul className="filter-list">
            <li>
              <button
                type="button"
                className={`filter-btn${activeAlbum === ALL_ALBUMS ? ' active' : ''}`}
                aria-pressed={activeAlbum === ALL_ALBUMS}
                aria-controls="project-grid"
                data-album={ALL_ALBUMS}
                onClick={() => setActiveAlbum(ALL_ALBUMS)}
              >
                ALL
              </button>
            </li>
            {albums.map((album) => (
              <li key={album}>
                <button
                  type="button"
                  className={`filter-btn${album === activeAlbum ? ' active' : ''}`}
                  aria-pressed={album === activeAlbum}
                  aria-controls="project-grid"
                  data-album={album}
                  onClick={() => setActiveAlbum(album)}
                >
                  {album.toUpperCase()}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div
        id="project-grid"
        className={`project-grid masonry${placement.length > 0 ? ' is-packed' : ''}`}
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
    </div>
  );
}
