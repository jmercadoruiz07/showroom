/*
|-------------------------------------------------------------------------------
| HeroCarousel — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| Single project image filling the hero background. The projects are shuffled
| in the browser on each page load; the image then crossfades to the next
| project in the shuffled order every few seconds. Rotation pauses on
| hover/focus and while the tab is hidden, and is disabled for
| prefers-reduced-motion.
|
*/
import { useEffect, useState } from 'react';
import styles from './HeroCarousel.module.css';

const SWAP_INTERVAL_MS = 5000;

export interface HeroSlide {
  src: string;
  title: string;
  href: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
}

function shuffled<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setMatches(list.matches);
    update();
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, [query]);

  return matches;
}

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [order, setOrder] = useState<HeroSlide[] | null>(null);
  const [swaps, setSwaps] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [layers, setLayers] = useState<HeroSlide[]>([]);

  useEffect(() => {
    setOrder(shuffled(slides));
  }, [slides]);

  const rotates = order !== null && order.length > 1 && !reducedMotion;

  useEffect(() => {
    if (!rotates || isPaused) return;

    const timer = window.setInterval(() => {
      if (!document.hidden) setSwaps((count) => count + 1);
    }, SWAP_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [rotates, isPaused]);

  const current = order && order.length > 0 ? order[swaps % order.length] : null;

  // The previous image stays underneath until the incoming one has finished fading in.
  useEffect(() => {
    if (!current) return;
    setLayers((existing) =>
      existing[existing.length - 1]?.href === current.href
        ? existing
        : [...existing.slice(-1), current],
    );
  }, [current]);

  // Fetch the next image ahead of its crossfade so it never fades in empty.
  useEffect(() => {
    if (!rotates || !order) return;
    new Image().src = order[(swaps + 1) % order.length].src;
  }, [rotates, order, swaps]);

  return (
    <div
      className={styles.carousel}
      role="group"
      aria-label="Featured project"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {current && (
        <a className={styles.link} href={current.href} aria-label={`View ${current.title}`}>
          {layers.map((layer) => (
            <img
              key={layer.href}
              className={styles.image}
              src={layer.src}
              alt=""
              decoding="async"
              onAnimationEnd={() => setLayers((existing) => existing.slice(-1))}
            />
          ))}
        </a>
      )}
    </div>
  );
}
