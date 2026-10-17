/*
|-------------------------------------------------------------------------------
| FeaturedAccordion — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| Vertical stack of full-width project strips. From 768px up each strip is
| closed until it is hovered or focused; below 768px every strip is always
| open. The strips handle both themselves, see FeaturedAccordionItem.
|
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
