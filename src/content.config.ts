import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: file('./src/content/projects.json'),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    albums: z.array(z.string()).optional().default([]),
    categories: z.array(z.string()).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    thumbnail: z.string(),
    images: z.array(z.string()).optional().default([]),
    video: z.string().optional(),
    videoPoster: z.string().optional(),
    sourceUrl: z.string().optional(),
    tools: z.array(z.string()).optional().default([]),
    description: z.string().default(''),
    featured: z.boolean().optional().default(false),
    order: z.number().optional(),
    stats: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const collections = { projects };
