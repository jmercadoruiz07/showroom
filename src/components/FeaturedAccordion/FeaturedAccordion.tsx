/*
|-------------------------------------------------------------------------------
| FeaturedAccordion — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| Vertical stack of full-width project strips. Each strip opens to a fixed
| height on hover; see FeaturedAccordionItem. Where hover is unavailable, the
| strip crossing the viewport centre is the only one open.
|
*/
import { useEffect, useState } from 'react';
import type { ProjectCardProps } from '../ProjectCard/ProjectCard';
import FeaturedAccordionItem from './FeaturedAccordionItem';
import styles from './FeaturedAccordion.module.css';

export type FeaturedAccordionProject = Omit<ProjectCardProps, 'style'>;

interface FeaturedAccordionProps {
  projects: FeaturedAccordionProject[];
}

export default function FeaturedAccordion({ projects }: FeaturedAccordionProps) {
  const [autoExpand, setAutoExpand] = useState(false);
  const [activeHref, setActiveHref] = useState<string | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(hover: none), (pointer: coarse)');
    const update = () => setAutoExpand(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.list}>
        {projects.map((project) => (
          <FeaturedAccordionItem
            key={project.href}
            {...project}
            expanded={autoExpand && activeHref === project.href}
            onReachCenter={autoExpand ? () => setActiveHref(project.href) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
