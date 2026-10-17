/*
|-------------------------------------------------------------------------------
| FeaturedAccordion — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| Vertical stack of full-width project strips. Each strip opens to a fixed
| height on hover; see FeaturedAccordionItem. Where hover is unavailable, the
| strip crossing the viewport centre is the only one open. The last strip can
| stop short of the centre when the page ends, so reaching the bottom of the
| page opens it.
|
*/
import { useEffect, useState } from 'react';
import type { ProjectCardProps } from '../ProjectCard/ProjectCard';
import FeaturedAccordionItem, { type FeaturedAccordionImages } from './FeaturedAccordionItem';
import styles from './FeaturedAccordion.module.css';

export type FeaturedAccordionProject = Omit<ProjectCardProps, 'style'> & FeaturedAccordionImages;

interface FeaturedAccordionProps {
  projects: FeaturedAccordionProject[];
}

function isAtPageBottom(): boolean {
  return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
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

  const lastHref = projects[projects.length - 1]?.href;

  useEffect(() => {
    if (!autoExpand || !lastHref) return;
    const onScroll = () => {
      if (isAtPageBottom()) setActiveHref(lastHref);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [autoExpand, lastHref]);

  return (
    <div className={styles.root}>
      <div className={styles.list}>
        {projects.map((project) => (
          <FeaturedAccordionItem
            key={project.href}
            {...project}
            expanded={autoExpand && activeHref === project.href}
            onReachCenter={
              autoExpand ? () => !isAtPageBottom() && setActiveHref(project.href) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
