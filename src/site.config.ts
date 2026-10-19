/** Site-wide settings. Edit freely. */
export const siteConfig = {
  title: 'AI4PD',
  tagline: 'The daily AI digest for product designers',
  description: 'A daily, agent-curated briefing on AI agents, agentic experience design, competitors, UX and AI news.',
  /** Timezone used for edition dates (must match the agent's). */
  timezone: 'America/Montevideo',
  locale: 'en-US',
  /** Label for an article's `whyItMatters` line, per topic slug (falls back to `default`). */
  whyItMattersLabel: {
    default: 'Why it matters',
    'agentic-design': 'Design takeaway',
  } as Record<string, string>,
  credit: { name: 'Leandro Villaverde', url: 'https://lvillaverde.com' },
  /** How many past editions the RSS feed includes. */
  rssEditions: 7,
};
