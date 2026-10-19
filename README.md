# AI4PD

*The daily AI digest for product designers.* A static, newspaper-style site. All content comes from JSON files written each morning by an AI agent; every push to `main` validates the data and redeploys to GitHub Pages.

```
agent → data/news/YYYY-MM-DD.json → push to main → GitHub Action (validate → build) → GitHub Pages
```

Built with [Astro](https://astro.build), no client-side framework.

## Local development

Requires Node 22.22+ (CI uses the version in `.nvmrc`).

```bash
npm ci
npm run dev        # http://localhost:4321
npm run validate   # check every file in data/
npm run build      # static site in dist/
npm run preview    # serve dist/
npm run check      # validate + build
```

To preview exactly as on GitHub Pages (under `/<repo>/`):

```bash
BASE_PATH=/ai4pd npm run build && BASE_PATH=/ai4pd npm run preview
```

## First-time setup

1. Create a GitHub repository and push this folder to `main`.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. Run the **Deploy to GitHub Pages** workflow once (Actions tab → Run workflow), or push any change.
4. Create a fine-grained Personal Access Token for the agent: repository access = this repo only, permission **Contents: Read and write**.
5. Give the agent the token and the contents of [`AGENT.md`](AGENT.md).
6. Delete the sample files in `data/news/` once the agent's first real edition lands.

Custom domain later: add it in Settings → Pages; the workflow passes the right `SITE_URL`/`BASE_PATH` automatically.

## Project structure

```
data/
  topics.json            # sections (edit to change topics)
  news/YYYY-MM-DD.json   # one file per day, written by the agent
schema/                  # JSON Schemas (contract with the agent)
scripts/validate.mjs     # npm run validate
src/
  site.config.ts         # title, tagline, timezone, RSS length
  styles/tokens.css      # ← all colors, fonts, spacing. Restyle here.
  styles/global.css
  content.config.ts      # Zod schema (mirrors schema/news.schema.json)
  lib/                   # data access, formatting, base-path URLs
  components/
  pages/                 # /, /topic/[slug]/, /day/[date]/, /day/[date]/[id]/ (story), /archive/, /rss.xml, 404
.github/workflows/       # deploy.yml (main), validate.yml (PRs)
```

## Changing topics

Edit `data/topics.json` (`slug`, `name`, `description`). Slugs are lowercase kebab-case. Removing a topic that older editions still use will fail validation — keep it, or clean those files up too. Tell the agent about the change.

## Changing the design

Everything visual lives in `src/styles/tokens.css` (light values on `:root`, dark values in the `prefers-color-scheme: dark` block). The type is DM Sans (loaded from Google Fonts in `src/layouts/Base.astro`): bold headlines, light summaries. Layout is image-led: a lead story with secondary stories beside it, then topic rows of 2, 3 or 4 columns (`src/components/StoryGrid.astro`) with 16:9 images.

## Safety net

Data is validated twice: `npm run validate` (JSON Schema + cross-checks: known topic, date matches filename, unique ids, `imageAlt` with images) and the Zod schema at build time. If either fails, nothing deploys and the previous version stays live.
