# Agent integration contract

Paste this into the instructions of the morning news agent.

## What to produce

Every morning, create **one** JSON file for today's edition and commit it directly to `main`:

```
data/news/YYYY-MM-DD.json
```

- `YYYY-MM-DD` is today's date in **America/Montevideo** (configurable in `src/site.config.ts` — keep both in sync).
- If you run more than once on the same day, **overwrite** today's file. Never edit or delete other days.
- Do not edit any other file. The site discovers editions automatically; there is no index to maintain.

## Before writing

1. Read `data/topics.json`. Use **only** those `slug` values in `topic`.
2. Aim for 1–3 articles per topic (60 max per day). Mark the single most important story with `"featured": true`.
3. Order articles by topic (in `topics.json` order), and within each topic put the strongest story first. The first story of the two other topics that come first is shown next to the lead.
4. **Open every article** (web fetch) before writing about it. The summary, author and publish time must come from the page itself, not a search snippet.

## Where each field appears

| Field | Homepage card | Story page (`/day/<date>/<id>/`) |
|---|---|---|
| `headline` | ✓ | ✓ (title) |
| `excerpt` | ✓ (under the image) | ✓ (standfirst under the title) |
| `imageUrl` / `imageAlt` | ✓ | ✓ (large, with `imageAlt` as caption) |
| `summary` (2 paragraphs) | – | ✓ |
| `whyItMatters` | – | ✓ (highlighted box) |
| `sourceName`, `author`, `publishedAt`, `tags` | source + date | ✓ (byline + facts panel) |
| `sourceUrl` | – | ✓ ("Read the full article" button) |

## Writing

- **`excerpt`**: one short sentence (30–160 chars) that says what happened. It must not repeat the headline.
- **`summary`**: **exactly two paragraphs** (an array of two strings, 150–900 chars each), in your own words. Paragraph 1: what happened (who, what, key numbers). Paragraph 2: the important details, context, caveats or what comes next. Do not copy sentences from the article, and do not include the "why it matters" line here.
- **`whyItMatters`**: optional, one sentence on why it matters to product designers building AI and work-management products (for `agentic-design`, the concrete pattern or idea to apply). Write only the sentence; the site adds the label ("Why it matters", or "Design takeaway" for `agentic-design`). The site is public: **never mention Slingshot, Infragistics or any reader by name** anywhere in the file. Omit it when there's no real connection.
- **`author`**: the byline as published (several names comma-separated). Omit it if the page shows none.
- **`publishedAt`**: the exact time from the page when available (`article:published_time` meta). Use `T12:00:00Z` only when just the day is known; the site then shows the date without a time.

## Images (required)

**Every article must have an image.** The layout is image-led (16:9 photos on every card).

1. Use the article's preview image: `<meta property="og:image">` (fallback: `twitter:image`, then the first large image in the article body). Use the absolute `https://` URL as published; don't download or re-host it.
2. If the page blocks the request, try fetching it again as a normal browser would. If it still fails, use the `og:image` of the original announcement (the company's blog post or press release about the same news).
3. `imageAlt` describes what the image actually shows (e.g. "OpenAI CEO Sam Altman", "Figma canvas with an agent chat panel"). Use the page's `og:image:alt` when it has one; otherwise describe it. Don't repeat the headline.
4. Never use a generic stock photo or an unrelated image. If no real image can be found for a story, **leave that story out** of the edition.

If an image fails to load in a visitor's browser, the site shows a branded placeholder with the topic and source, so a broken image never breaks the layout.

## File format

Formal schema: `schema/news.schema.json`.

```json
{
  "schemaVersion": 2,
  "date": "2026-10-19",
  "generatedAt": "2026-10-19T07:05:00-03:00",
  "articles": [
    {
      "id": "2026-10-19-competitors-01",
      "topic": "competitors",
      "headline": "Headline, 5–200 characters",
      "excerpt": "One short sentence for the homepage, 30–160 characters.",
      "summary": [
        "Paragraph 1, 150–900 characters: what happened.",
        "Paragraph 2, 150–900 characters: details, context and what comes next."
      ],
      "whyItMatters": "Optional one-sentence takeaway for product designers.",
      "sourceName": "Publication name",
      "sourceUrl": "https://publication.com/the-article",
      "author": "Author Name",
      "publishedAt": "2026-10-19T13:05:01Z",
      "featured": true,
      "imageUrl": "https://publication.com/image.jpg",
      "imageAlt": "What the image shows",
      "tags": ["optional", "keywords"]
    }
  ]
}
```

| Field | Required | Rules |
|---|---|---|
| `schemaVersion` | yes | Always `2` |
| `date` | yes | Must equal the filename date |
| `generatedAt` | yes | ISO 8601 with timezone offset |
| `id` | yes | Lowercase kebab-case, unique within the file. Convention: `<date>-<topic>-<nn>`. Becomes the story page URL |
| `topic` | yes | A slug from `data/topics.json` |
| `headline` | yes | 5–200 chars |
| `excerpt` | yes | 30–160 chars, one sentence |
| `summary` | yes | Array of exactly 2 paragraphs, 150–900 chars each, your own words |
| `whyItMatters` | no | 20–400 chars, one sentence, no label prefix |
| `sourceName` | yes | 1–80 chars |
| `sourceUrl` | yes | Must start with `https://` |
| `author` | no | 1–120 chars |
| `publishedAt` | yes | ISO 8601 with timezone (`Z` or offset) |
| `featured` | no | `true` for the lead story only |
| `imageUrl` | yes | `https://` only |
| `imageAlt` | yes | 1–300 chars |
| `tags` | no | Up to 8 unique strings |

No other fields are allowed.

## Committing

- Commit message: `news: YYYY-MM-DD (N articles)`
- Push directly to `main`. The deploy workflow validates and publishes automatically (~1–2 min).
- If possible, run `npm ci && npm run validate` before pushing. If the file is invalid the deploy fails and the previous edition stays online.

## Authentication

Push with a **fine-grained Personal Access Token** (or a GitHub App token) scoped to this repository only, with permission **Contents: Read and write**. Nothing else is needed.

> Pushes made with the default `GITHUB_TOKEN` from another GitHub Actions workflow do **not** trigger the deploy workflow. A PAT or GitHub App token does.

Alternative without git: the GitHub REST API `PUT /repos/{owner}/{repo}/contents/data/news/{date}.json` (base64 content, include `sha` when overwriting) with the same token.
