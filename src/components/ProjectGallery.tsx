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
import ProjectCard, { type ProjectCategory } from './ProjectCard';
import './ProjectGallery.css';

export interface GalleryProject {
  title: string;
  category: ProjectCategory;
  thumbnail: string;
  thumbnailAlt?: string;
  href: string;
  featured?: boolean;
}

export const PROJECT_CATEGORIES: Array<ProjectCategory | 'all'> = [
  'all',
  'renders',
  'physicalMediums',
];

const categoryLabels: Record<ProjectCategory | 'all', string> = {
  all: 'ALL',
  renders: 'RENDERS',
  physicalMediums: 'PHYSICAL MEDIUMS',
};

interface ProjectGalleryProps {
  projects: GalleryProject[];
}

export default function ProjectGallery({ projects }: ProjectGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | 'all'>('all');

  return (
    <div className="project-gallery">
      <div className="filter-wrapper">
        <nav className="category-filter" aria-label="Filter projects by category">
          <ul className="filter-list">
            {PROJECT_CATEGORIES.map((category) => (
              <li key={category}>
                <button
                  type="button"
                  className={`filter-btn${category === activeCategory ? ' active' : ''}`}
                  aria-pressed={category === activeCategory}
                  aria-controls="project-grid"
                  data-category={category}
                  onClick={() => setActiveCategory(category)}
                >
                  {categoryLabels[category]}
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
            activeCategory === 'all' || project.category === activeCategory;
          return (
            <ProjectCard
              key={project.href}
              title={project.title}
              category={project.category}
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
