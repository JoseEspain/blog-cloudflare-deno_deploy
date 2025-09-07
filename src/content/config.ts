import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    published_at: z.coerce.date(),
    blurb: z.string(),
    tags: z.array(z.string()),
    isPinned: z.boolean().optional().default(false),
    layoutMode: z.enum(['app', 'document']).optional().default('document'),
  }),
});

export const collections = {
  'blog': blogCollection,
};
