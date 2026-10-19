import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Mirrors schema/news.schema.json — keep both in sync. */
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const httpsUrl = z.url().startsWith('https://');

const article = z
  .object({
    id: slug.max(100),
    topic: slug,
    headline: z.string().min(5).max(200),
    summary: z.string().min(20).max(1200),
    sourceName: z.string().min(1).max(80),
    sourceUrl: httpsUrl,
    publishedAt: z.iso.datetime({ offset: true }),
    featured: z.boolean().optional(),
    imageUrl: httpsUrl.optional(),
    imageAlt: z.string().min(1).max(300).optional(),
    tags: z.array(z.string().min(1).max(30)).max(8).optional(),
  })
  .strict()
  .refine((a) => !a.imageUrl || a.imageAlt, { message: 'imageAlt is required when imageUrl is set', path: ['imageAlt'] });

const news = defineCollection({
  loader: glob({ pattern: '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9].json', base: './data/news' }),
  schema: z
    .object({
      schemaVersion: z.literal(1),
      date: z.iso.date(),
      generatedAt: z.iso.datetime({ offset: true }),
      articles: z.array(article).min(1).max(60),
    })
    .strict(),
});

export const collections = { news };
