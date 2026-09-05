/*
|-------------------------------------------------------------------------------
| ProjectGallery — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| Horizontal pill/tag filter (sticky below header) + masonry grid of project cards.
| Toggles visibility client-side via React state, no re-render of full list needed.
|
*/
import { useState } from 'react';
import ProjectCard from './ProjectCard';
import './ProjectGallery.css';

export interface GalleryProject {
  title: string;
  album: string;
  thumbnail: string;
  thumbnailAlt?: string;
  href: string;
  featured?: boolean;
}

export const ALL_ALBUMS = 'all';

interface ProjectGalleryProps {
  projects: GalleryProject[];
  albums: string[];
}

export default function ProjectGallery({ projects, albums }: ProjectGalleryProps) {
  const [activeAlbum, setActiveAlbum] = useState<string>(ALL_ALBUMS);

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
      >
        {projects.map((project) => {
          const isVisible =
            activeAlbum === ALL_ALBUMS || project.album === activeAlbum;
          return (
            <ProjectCard
              key={project.href}
              title={project.title}
              album={project.album}
              thumbnail={project.thumbnail}
              thumbnailAlt={project.thumbnailAlt}
              href={project.href}
              featured={project.featured}
              className={isVisible ? 'is-visible' : undefined}
              style={isVisible ? undefined : { display: 'none' }}
            />
          );
        })}
      </div>
    </div>
  );
}
