/*
|-------------------------------------------------------------------------------
| HeroCarousel — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| Auto-rotating hero background matching original portfolio.
| Full-bleed background images crossfade every 3 seconds.
| No captions, no dot navigation, no links.
| Rotation pauses on hover/focus and while tab is hidden.
| Disabled for prefers-reduced-motion.
|
*/
import { useEffect, useState } from 'react';
import './HeroCarousel.css';

const ROTATION_INTERVAL_MS = 3000;

export interface HeroSlide {
  src: string;
  alt: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
}

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const rotates = slides.length > 1 && !reducedMotion;

  useEffect(() => {
    if (!rotates || isPaused) return;

    const timer = window.setInterval(() => {
      if (!document.hidden) {
        setActiveIndex((index) => (index + 1) % slides.length);
      }
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [rotates, isPaused, slides.length]);

  return (
    <div
      className="hero-carousel"
      aria-roledescription="carousel"
      aria-label="Hero background slideshow"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="hero-slides" aria-hidden="true">
        {slides.map((slide, index) => (
          <img
            key={slide.src}
            className={`hero-slide${index === activeIndex ? ' is-active' : ''}`}
            data-index={index}
            src={slide.src}
            alt={slide.alt}
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'high' : undefined}
            decoding="async"
          />
        ))}
      </div>
    </div>
  );
}
