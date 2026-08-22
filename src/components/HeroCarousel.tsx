/*
|-------------------------------------------------------------------------------
| HeroCarousel — JMR Visuals Portfolio
|-------------------------------------------------------------------------------
|
| Auto-rotating hero background cycling through featured projects. Slides
| crossfade every 6 seconds; a caption links to the project on screen and
| dots switch slides manually. Rotation pauses on hover/focus and while the
| tab is hidden, and is disabled for prefers-reduced-motion.
|
*/
import { useEffect, useState } from 'react';
import './HeroCarousel.css';

const ROTATION_INTERVAL_MS = 6000;

export interface HeroSlide {
  src: string;
  alt: string;
  title: string;
  href: string;
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
  }, [rotates, isPaused, slides.length, activeIndex]);

  const current = slides[activeIndex];

  return (
    <div
      className="hero-carousel"
      aria-roledescription="carousel"
      aria-label="Featured projects"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="hero-slides" aria-hidden="true">
        {slides.map((slide, index) => (
          <img
            key={slide.href}
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

      <div className="hero-controls">
        <a className="hero-slide-link text-mono" href={current.href}>
          {current.title}
        </a>

        <nav className="hero-dots" aria-label="Featured project slides">
          {slides.map((slide, index) => (
            <button
              key={slide.href}
              type="button"
              className={`hero-dot${index === activeIndex ? ' is-active' : ''}`}
              aria-label={`Show ${slide.title}`}
              aria-current={index === activeIndex || undefined}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}
