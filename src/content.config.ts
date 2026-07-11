import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum(['print', '3d', 'motion']),
    tags: z.array(z.string()).optional().default([]),
    thumbnail: z.string(),
    images: z.array(z.string()).optional().default([]),
    model: z.string().optional(),
    modelPoster: z.string().optional(),
    tools: z.array(z.string()).optional().default([]),
    description: z.string(),
    featured: z.boolean().optional().default(false),
    order: z.number().optional(),
  }),
});

export const collections = { projects };
