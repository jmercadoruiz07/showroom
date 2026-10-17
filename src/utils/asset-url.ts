// Resolves a file under `public/assets/` to a URL that includes the site base.
export const assetUrl = (path: string): string =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/assets/${path.replace(/^\/+/, '')}`;

// Prefixes an internal page path ("/works", "/") with the site base.
export const pageUrl = (path: string): string =>
  `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\/+/, '')}`;
