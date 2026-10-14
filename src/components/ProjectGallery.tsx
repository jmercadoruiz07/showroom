/*
|-------------------------------------------------------------------------------
| ProjectGallery — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| SimpleGrid 12-column system replacing masonry packer.
| Receives activeCategory as prop (controlled by parent).
| Responsive: single column mobile, 2-col tablet, 3-4 col desktop.
|
*/
import type { CSSProperties } from 'react';
import ProjectCard, { type ProjectCardThumbnail } from './ProjectCard';
import './ProjectGallery.css';

export interface GalleryProject {
  title: string;
  category: string;
  thumbnail: ProjectCardThumbnail;
  thumbnailAlt?: string;
  href: string;
}

export const ALL_CATEGORIES = 'all';

interface ProjectGalleryProps {
  projects: GalleryProject[];
  categories: string[];
  activeCategory?: string;
}

export default function ProjectGallery({ projects, categories, activeCategory = ALL_CATEGORIES }: ProjectGalleryProps) {
  // Filter projects based on activeCategory prop
  const visibleProjects = projects.filter(
    (p) => activeCategory === ALL_CATEGORIES || p.category === activeCategory,
  );

  return (
    <div className="project-gallery">
      <div
        id="project-grid"
        className="project-grid simple-grid reveal-stagger is-visible"
        aria-label="Projects"
      >
        {visibleProjects.map((project) => (
          <ProjectCard
            key={project.href}
            title={project.title}
            category={project.category}
            thumbnail={project.thumbnail}
            thumbnailAlt={project.thumbnailAlt}
            href={project.href}
            className="is-visible"
          />
        ))}
      </div>
    </div>
  );
}
