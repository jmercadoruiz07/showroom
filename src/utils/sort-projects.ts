import type { CollectionEntry } from 'astro:content';

/**
 * Sorts projects by their explicit `order`, falling back to newest first.
 * Projects without an `order` come after those that have one.
 */
export function sortProjectsByOrder(
  projects: CollectionEntry<'projects'>[],
): CollectionEntry<'projects'>[] {
  return [...projects].sort((a, b) => {
    if (a.data.order !== undefined && b.data.order !== undefined) {
      return a.data.order - b.data.order;
    }
    if (a.data.order !== undefined) return -1;
    if (b.data.order !== undefined) return 1;
    return b.data.date.getTime() - a.data.date.getTime();
  });
}
