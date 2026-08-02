import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum(['renders', 'physicalMediums']),
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
  }),
});

export const collections = { projects };
