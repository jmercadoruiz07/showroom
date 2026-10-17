/*
|-------------------------------------------------------------------------------
| HeroCarousel — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| Single image filling the hero background. The images are shuffled in the
| browser on each page load; the background then crossfades to the next image
| in the shuffled order every few seconds. Rotation pauses on hover and while
| the tab is hidden, and is disabled for prefers-reduced-motion. The image is
| decorative and not interactive.
|
*/
import { useEffect, useState } from 'react';
import styles from './HeroCarousel.module.css';

const SWAP_INTERVAL_MS = 4000;

interface HeroCarouselProps {
  images: string[];
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

export default function HeroCarousel({ images }: HeroCarouselProps) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [order, setOrder] = useState<string[] | null>(null);
  const [swaps, setSwaps] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [layers, setLayers] = useState<string[]>([]);

  useEffect(() => {
    setOrder(shuffled(images));
  }, [images]);

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
      existing[existing.length - 1] === current ? existing : [...existing.slice(-1), current],
    );
  }, [current]);

  // Fetch the next image ahead of its crossfade so it never fades in empty.
  useEffect(() => {
    if (!rotates || !order) return;
    new Image().src = order[(swaps + 1) % order.length];
  }, [rotates, order, swaps]);

  return (
    <div
      className={styles.carousel}
      aria-hidden="true"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {layers.map((src) => (
        <img
          key={src}
          className={styles.image}
          src={src}
          alt=""
          decoding="async"
          onAnimationEnd={() => setLayers((existing) => existing.slice(-1))}
        />
      ))}
    </div>
  );
}
