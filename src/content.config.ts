import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const projectImage = z.object({
  url: z.string(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
});

// Images and videos in the order ArtStation shows them. A video's `url` is the player's iframe src.
const projectMedia = z.discriminatedUnion('type', [
  projectImage.extend({ type: z.literal('image') }),
  z.object({ type: z.literal('video'), url: z.string(), poster: projectImage }),
]);

const projects = defineCollection({
  loader: file('./src/content/projects.json'),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    albums: z.array(z.string()).optional().default([]),
    categories: z.array(z.string()).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    thumbnail: projectImage,
    media: z.array(projectMedia).optional().default([]),
    sourceUrl: z.string().optional(),
    tools: z.array(z.string()).optional().default([]),
    description: z.string().default(''),
    featured: z.boolean().optional().default(false),
    order: z.number().optional(),
    stats: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const collections = { projects };
