import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getEditions, getTopic } from '../lib/data';
import { siteConfig } from '../site.config';
import { storyUrl } from '../lib/url';

export async function GET(context: APIContext) {
  const editions = (await getEditions()).slice(0, siteConfig.rssEditions);
  const base = import.meta.env.BASE_URL;
  return rss({
    title: siteConfig.title,
    description: siteConfig.description,
    site: new URL(base, context.site),
    items: editions.flatMap((e) =>
      e.articles.map((a) => ({
        title: a.headline,
        description: a.excerpt,
        link: new URL(storyUrl(e.date, a.id), context.site).href,
        pubDate: new Date(a.publishedAt),
        categories: [getTopic(a.topic)?.name ?? a.topic],
        customData: `<guid isPermaLink="false">${a.id}</guid>`,
      })),
    ),
  });
}
