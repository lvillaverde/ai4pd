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

## File format

Formal schema: `schema/news.schema.json`.

```json
{
  "schemaVersion": 1,
  "date": "2026-10-19",
  "generatedAt": "2026-10-19T07:05:00-03:00",
  "articles": [
    {
      "id": "2026-10-19-product-design-01",
      "topic": "product-design",
      "headline": "Headline, 5–200 characters",
      "summary": "Original 2–4 sentence summary in English (20–1200 characters). Do not copy the article text.",
      "sourceName": "Publication name",
      "sourceUrl": "https://publication.com/the-article",
      "publishedAt": "2026-10-18T14:00:00Z",
      "featured": true,
      "imageUrl": "https://publication.com/image.jpg",
      "imageAlt": "Description of the image",
      "tags": ["optional", "keywords"]
    }
  ]
}
```

| Field | Required | Rules |
|---|---|---|
| `schemaVersion` | yes | Always `1` |
| `date` | yes | Must equal the filename date |
| `generatedAt` | yes | ISO 8601 with timezone offset |
| `id` | yes | Lowercase kebab-case, unique within the file. Convention: `<date>-<topic>-<nn>` |
| `topic` | yes | A slug from `data/topics.json` |
| `headline` | yes | 5–200 chars |
| `summary` | yes | 20–1200 chars, your own words |
| `sourceName` | yes | 1–80 chars |
| `sourceUrl` | yes | Must start with `https://` |
| `publishedAt` | yes | ISO 8601 with timezone (`Z` or offset) |
| `featured` | no | `true` for the lead story |
| `imageUrl` | no | `https://` only. If present, `imageAlt` is required |
| `imageAlt` | if image | 1–300 chars |
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
