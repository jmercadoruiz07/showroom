import type { CollectionEntry } from 'astro:content';

/**
 * Sorts projects by date, newest first.
 */
export function sortProjectsByOrder(
  projects: CollectionEntry<'projects'>[],
): CollectionEntry<'projects'>[] {
  return [...projects].sort((a, b) => {
    return b.data.date.getTime() - a.data.date.getTime();
  });
}
