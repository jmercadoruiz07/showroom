/*
|-------------------------------------------------------------------------------
| HeroCarousel — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| Column of four project images at the right of the hero. The projects are
| shuffled in the browser on each page load; one slot at a time then crossfades
| to the next project in the shuffled order. Rotation pauses on hover/focus and
| while the tab is hidden, and is disabled for prefers-reduced-motion. Nothing
| is rendered below the desktop breakpoint.
|
*/
import { useEffect, useState } from 'react';
import './HeroCarousel.css';

const SLOT_COUNT = 4;
const SWAP_INTERVAL_MS = 1800;
const DESKTOP_QUERY = '(min-width: 768px)';

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

// Slot k is replaced on swap k+1, k+5, ...; each swap takes the next project in order.
function slideIndexForSlot(slot: number, swaps: number, count: number): number {
  if (swaps <= slot) return slot % count;
  const lastSwap = slot + 1 + SLOT_COUNT * Math.floor((swaps - slot - 1) / SLOT_COUNT);
  return (SLOT_COUNT + lastSwap - 1) % count;
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

function HeroSlot({ slide }: { slide: HeroSlide }) {
  const [layers, setLayers] = useState<HeroSlide[]>([slide]);

  useEffect(() => {
    setLayers((current) =>
      current[current.length - 1].href === slide.href ? current : [current[current.length - 1], slide],
    );
  }, [slide]);

  return (
    <a className="hero-slot" href={slide.href} aria-label={`View ${slide.title}`}>
      {layers.map((layer) => (
        <img
          key={layer.href}
          className="hero-slot-image"
          src={layer.src}
          alt=""
          decoding="async"
          onAnimationEnd={() => setLayers((current) => current.slice(-1))}
        />
      ))}
    </a>
  );
}

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [order, setOrder] = useState<HeroSlide[] | null>(null);
  const [swaps, setSwaps] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setOrder(shuffled(slides));
  }, [slides]);

  const rotates = order !== null && order.length > SLOT_COUNT && !reducedMotion;

  useEffect(() => {
    if (!rotates || isPaused) return;

    const timer = window.setInterval(() => {
      if (!document.hidden) setSwaps((count) => count + 1);
    }, SWAP_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [rotates, isPaused]);

  const visible =
    isDesktop && order !== null && order.length >= SLOT_COUNT
      ? Array.from({ length: SLOT_COUNT }, (_, slot) => order[slideIndexForSlot(slot, swaps, order.length)])
      : null;

  return (
    <div
      className="hero-column"
      role="group"
      aria-label="Featured projects"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {visible
        ? visible.map((slide, slot) => <HeroSlot key={slot} slide={slide} />)
        : Array.from({ length: SLOT_COUNT }, (_, slot) => <div key={slot} className="hero-slot" />)}
    </div>
  );
}
