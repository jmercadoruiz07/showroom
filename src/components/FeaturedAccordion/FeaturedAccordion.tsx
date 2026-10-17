/*
|-------------------------------------------------------------------------------
| FeaturedAccordion — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| Vertical stack of full-width project strips. Each strip opens to a fixed
| height on hover; see FeaturedAccordionItem. Where hover is unavailable,
| exactly one strip is open at any time, chosen by the scroll position: the
| stretch of page over which the viewport centre travels through the list is
| split into equal parts, one per strip, so every strip stays open for the
| same scroll distance. Because one strip is always open the list's height
| never changes, which keeps the scroll position and the choice from feeding
| back into each other. The first strip is open before the list is reached;
| the stretch ends where the centre reaches the bottom of the list or of the
| page, whichever comes first, so the last strip always gets its turn.
|
*/
import { useEffect, useRef, useState } from 'react';
import type { ProjectCardProps } from '../ProjectCard/ProjectCard';
import FeaturedAccordionItem, { type FeaturedAccordionImages } from './FeaturedAccordionItem';
import styles from './FeaturedAccordion.module.css';

export type FeaturedAccordionProject = Omit<ProjectCardProps, 'style'> & FeaturedAccordionImages;

interface FeaturedAccordionProps {
  projects: FeaturedAccordionProject[];
}

export default function FeaturedAccordion({ projects }: FeaturedAccordionProps) {
  const [autoExpand, setAutoExpand] = useState(false);
  const [activeHref, setActiveHref] = useState<string | undefined>(projects[0]?.href);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia('(hover: none), (pointer: coarse)');
    const update = () => setAutoExpand(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const hrefs = projects.map((project) => project.href).join('|');

  useEffect(() => {
    const list = listRef.current;
    if (!autoExpand || !list) return;
    const ids = hrefs.split('|');

    const update = () => {
      const { top: viewportTop, height } = list.getBoundingClientRect();
      const top = viewportTop + window.scrollY;
      const centre = window.scrollY + window.innerHeight / 2;
      const lastCentre = document.documentElement.scrollHeight - window.innerHeight / 2;
      const span = Math.min(top + height, lastCentre) - top;
      const part = span > 0 ? Math.floor(((centre - top) / span) * ids.length) : 0;
      setActiveHref(ids[Math.min(Math.max(part, 0), ids.length - 1)]);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    // The list grows when the first strip opens after hydration, and the page above it can change too.
    const observer = new ResizeObserver(update);
    observer.observe(list);
    observer.observe(document.documentElement);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      observer.disconnect();
    };
  }, [autoExpand, hrefs]);

  return (
    <div className={styles.root}>
      <div ref={listRef} className={styles.list}>
        {projects.map((project) => (
          <FeaturedAccordionItem
            key={project.href}
            {...project}
            expanded={autoExpand && activeHref === project.href}
          />
        ))}
      </div>
    </div>
  );
}
