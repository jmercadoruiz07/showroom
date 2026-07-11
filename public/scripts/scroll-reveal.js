/**
 * Scroll Reveal — JMR Visuals Portfolio
 *
 * Uses Intersection Observer to add .is-visible to .reveal and
 * .reveal-stagger elements when they enter the viewport.
 * Respects prefers-reduced-motion.
 */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Make everything visible immediately
    document
      .querySelectorAll('.reveal, .reveal-stagger')
      .forEach(function (el) {
        el.classList.add('is-visible');
      });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal, .reveal-stagger').forEach(function (el) {
    observer.observe(el);
  });
})();
