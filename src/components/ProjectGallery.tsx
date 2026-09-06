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

// Must stay in sync with `--row-height` in ProjectGallery.css so the JS
// row-span math lines up with the CSS grid track height.
const ROW_HEIGHT_PX = 10;
const ROW_SPAN_FACTOR = 40;
const MIN_ROW_SPAN = 8;

interface ProjectGalleryProps {
  projects: GalleryProject[];
  albums: string[];
}

function cardRowSpan(thumbnail: ProjectCardThumbnail): number {
  const width = thumbnail.width ?? 1;
  const height = thumbnail.height ?? 1;
  return Math.max(MIN_ROW_SPAN, Math.round((height / width) * ROW_SPAN_FACTOR));
}

interface Slot {
  column: number;
  rowStart: number;
  rowSpan: number;
}

/**
 * Basic shortest-column packer: place each card into the column with the
 * smallest current height, then advance that column's height by the card's
 * row-span. Reads the live column count from the rendered grid so it adapts
 * to the responsive `grid-template-columns` declared in CSS.
 */
function computePlacement(grid: HTMLElement, rowSpans: number[]): Slot[] {
  const tracks = window.getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/);
  const columns = tracks.length || 1;
  const columnHeights = new Array<number>(columns).fill(1);
  return rowSpans.map((rowSpan) => {
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
      setPlacement(
        computePlacement(gridEl, visibleProjects.map((p) => cardRowSpan(p.thumbnail))),
      );
    };
    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(gridEl);
    return () => observer.disconnect();
  }, [gridEl, visibleProjects]);

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
        className="project-grid masonry reveal-stagger is-visible"
        aria-label="Projects"
        ref={setGridEl}
      >
        {visibleProjects.map((project, index) => {
          const slot = placement[index];
          const cardStyle: CSSProperties = slot
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
              className="is-visible"
              style={cardStyle}
            />
          );
        })}
      </div>
    </div>
  );
}
