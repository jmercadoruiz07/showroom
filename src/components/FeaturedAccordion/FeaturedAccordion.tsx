/**
 * Vertical stack of project strips: closed until hovered or focused from 768px up, always open below.
 * The strips handle both themselves, see FeaturedAccordionItem.
 */

import type { ProjectCardProps } from '../ProjectCard/ProjectCard';
import FeaturedAccordionItem, { type FeaturedAccordionImages } from './FeaturedAccordionItem';
import styles from './FeaturedAccordion.module.css';

export type FeaturedAccordionProject = Omit<ProjectCardProps, 'style'> & FeaturedAccordionImages;

interface FeaturedAccordionProps {
  projects: FeaturedAccordionProject[];
}

export default function FeaturedAccordion({ projects }: FeaturedAccordionProps) {
  return (
    <div className={styles.root}>
      <div className={styles.list}>
        {projects.map((project) => (
          <FeaturedAccordionItem key={project.href} {...project} />
        ))}
      </div>
    </div>
  );
}
