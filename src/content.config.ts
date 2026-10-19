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
    excerpt: z.string().min(30).max(160),
    summary: z.tuple([z.string().min(150).max(900), z.string().min(150).max(900)]),
    whyItMatters: z.string().min(20).max(400).optional(),
    sourceName: z.string().min(1).max(80),
    sourceUrl: httpsUrl,
    author: z.string().min(1).max(120).optional(),
    publishedAt: z.iso.datetime({ offset: true }),
    featured: z.boolean().optional(),
    imageUrl: httpsUrl,
    imageAlt: z.string().min(1).max(300),
    tags: z.array(z.string().min(1).max(30)).max(8).optional(),
  })
  .strict();

const news = defineCollection({
  loader: glob({ pattern: '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9].json', base: './data/news' }),
  schema: z
    .object({
      schemaVersion: z.literal(2),
      date: z.iso.date(),
      generatedAt: z.iso.datetime({ offset: true }),
      articles: z.array(article).min(1).max(60),
    })
    .strict(),
});

export const collections = { news };
