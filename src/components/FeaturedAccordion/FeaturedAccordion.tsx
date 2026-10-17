/*
|-------------------------------------------------------------------------------
| FeaturedAccordion — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| Vertical stack of full-width project strips. Each strip opens to a fixed
| height on hover; see FeaturedAccordionItem. Below 768px every strip is
| always open. On wider screens without hover (touch tablets),
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
  const [touchOnly, setTouchOnly] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeHref, setActiveHref] = useState<string | undefined>(projects[0]?.href);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const touchQuery = window.matchMedia('(hover: none), (pointer: coarse)');
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const update = () => {
      setTouchOnly(touchQuery.matches);
      setIsMobile(mobileQuery.matches);
    };
    update();
    touchQuery.addEventListener('change', update);
    mobileQuery.addEventListener('change', update);
    return () => {
      touchQuery.removeEventListener('change', update);
      mobileQuery.removeEventListener('change', update);
    };
  }, []);

  // On mobile the strips open themselves (see FeaturedAccordionItem), so only wider touch screens pick one.
  const autoExpand = touchOnly && !isMobile;

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
