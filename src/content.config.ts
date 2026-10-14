import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';

const projectImage = z.object({
  url: z.string(),
  alt: z.string().optional(),
});

const projects = defineCollection({
  loader: file('./src/content/projects.json'),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    albums: z.array(z.string()).optional().default([]),
    category: z.string().optional().default('renders'),
    tags: z.array(z.string()).optional().default([]),
    images: z.array(projectImage).optional().default([]),
    tools: z.array(z.string()).optional().default([]),
    description: z.string().default(''),
  }),
});

export const collections = { projects };
