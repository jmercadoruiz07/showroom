import type { CollectionEntry } from 'astro:content';

type ProjectMedia = CollectionEntry<'projects'>['data']['media'];
type ProjectImageAsset = Extract<ProjectMedia[number], { type: 'image' }>;

// A project's media holds images and videos in ArtStation's order; these pick out the images.
export const imageAssets = (media: ProjectMedia): ProjectImageAsset[] =>
  media.filter((item): item is ProjectImageAsset => item.type === 'image');

export const firstImage = (media: ProjectMedia): ProjectImageAsset | undefined =>
  imageAssets(media)[0];
