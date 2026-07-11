/**
 * Back to Top — JMR Visuals Portfolio
 *
 * Shows/hides a fixed back-to-top button based on scroll position.
 * Smooth scrolls to top on click.
 */
(function () {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        if (window.scrollY > 400) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
