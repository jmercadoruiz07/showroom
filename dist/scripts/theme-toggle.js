/**
 * Theme Toggle — JMR Visuals Portfolio
 *
 * Persists preference to localStorage. Respects prefers-color-scheme
 * on first visit. Toggles [data-theme] attribute on <html>.
 */
(function () {
  const STORAGE_KEY = 'theme';
  const html = document.documentElement;
  const toggle = document.getElementById('theme-toggle');

  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    if (toggle) {
      toggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
  }

  // Apply stored/system theme immediately
  applyTheme(getPreferredTheme());

  // Toggle on click
  if (toggle) {
    toggle.addEventListener('click', function () {
      const current = html.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // Listen for system preference changes
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', function (e) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
})();
