/*
|-------------------------------------------------------------------------------
| FeaturedAccordion — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| Vertical stack of full-width project strips. Each strip opens to a fixed
| height on hover; see FeaturedAccordionItem.
|
*/
import type { ProjectCardProps } from '../ProjectCard/ProjectCard';
import FeaturedAccordionItem from './FeaturedAccordionItem';
import styles from './FeaturedAccordion.module.css';

export type FeaturedAccordionProject = Omit<ProjectCardProps, 'style'>;

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
