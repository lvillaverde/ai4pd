import { getCollection, type CollectionEntry } from 'astro:content';
import { z } from 'astro/zod';
import topicsJson from '../../data/topics.json';

export type Edition = CollectionEntry<'news'>['data'];
export type Article = Edition['articles'][number];
export type Topic = { slug: string; name: string; description?: string };

const topicsSchema = z.object({
  topics: z.array(z.object({ slug: z.string(), name: z.string(), description: z.string().optional() })).min(1),
});

export const topics: Topic[] = topicsSchema.parse(topicsJson).topics;
const topicMap = new Map(topics.map((t) => [t.slug, t]));
export const getTopic = (slug: string) => topicMap.get(slug);

let cache: Edition[] | undefined;

/** All editions, newest first. Throws (failing the build) on cross-file rule violations. */
export async function getEditions(): Promise<Edition[]> {
  if (cache) return cache;
  const entries = await getCollection('news');
  const problems: string[] = [];
  for (const e of entries) {
    const fileDate = e.id.slice(0, 10);
    if (e.data.date !== fileDate) problems.push(`${e.id}.json: date "${e.data.date}" ≠ filename`);
    const ids = new Set<string>();
    for (const a of e.data.articles) {
      if (!topicMap.has(a.topic)) problems.push(`${e.id}.json: unknown topic "${a.topic}" in ${a.id}`);
      if (ids.has(a.id)) problems.push(`${e.id}.json: duplicate id "${a.id}"`);
      ids.add(a.id);
    }
  }
  if (problems.length) throw new Error(`Invalid news data:\n  ${problems.join('\n  ')}`);
  cache = entries.map((e) => e.data).sort((a, b) => b.date.localeCompare(a.date));
  return cache;
}

export async function getLatestEdition(): Promise<Edition | undefined> {
  return (await getEditions())[0];
}

/** Lead story: first featured article, else the first one. */
export function getLead(edition: Edition): Article {
  return edition.articles.find((a) => a.featured) ?? edition.articles[0];
}

export function byTopic(articles: Article[], slug: string): Article[] {
  return articles.filter((a) => a.topic === slug);
}
