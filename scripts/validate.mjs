#!/usr/bin/env node
/**
 * Validates data/topics.json and every data/news/*.json file.
 * Usage: npm run validate            (all files)
 *        npm run validate -- <file>  (specific files)
 * Exit code 1 on any error.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename, relative } from 'node:path';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const root = new URL('..', import.meta.url).pathname;
const rel = (p) => relative(root, p);
const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

const load = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const validateTopics = ajv.compile(load('schema/topics.schema.json'));
const validateNews = ajv.compile(load('schema/news.schema.json'));

const errors = [];
const err = (file, path, msg) => errors.push(`  ✗ ${rel(file)}${path ? ` → ${path}` : ''}: ${msg}`);

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    err(file, '', `not valid JSON (${e.message})`);
    return undefined;
  }
}

function reportAjv(file, validator) {
  for (const e of validator.errors ?? []) {
    const extra = e.params?.allowedValues ? ` (${e.params.allowedValues.join(', ')})`
      : e.params?.additionalProperty ? ` ("${e.params.additionalProperty}")` : '';
    err(file, e.instancePath || '(root)', `${e.message}${extra}`);
  }
}

// --- topics ---
const topicsFile = join(root, 'data/topics.json');
const topicsData = readJson(topicsFile);
let topicSlugs = new Set();
if (topicsData) {
  if (!validateTopics(topicsData)) reportAjv(topicsFile, validateTopics);
  else {
    const slugs = topicsData.topics.map((t) => t.slug);
    topicSlugs = new Set(slugs);
    if (topicSlugs.size !== slugs.length) err(topicsFile, '/topics', 'duplicate topic slugs');
  }
}

// --- news ---
const newsDir = join(root, 'data/news');
const args = process.argv.slice(2);
const files = args.length
  ? args.map((a) => (a.startsWith('/') ? a : join(process.cwd(), a)))
  : existsSync(newsDir)
    ? readdirSync(newsDir).filter((f) => f.endsWith('.json')).sort().map((f) => join(newsDir, f))
    : [];

const FILE_RE = /^(\d{4}-\d{2}-\d{2})\.json$/;
let articleCount = 0;

for (const file of files) {
  const m = basename(file).match(FILE_RE);
  if (!m) { err(file, '', 'filename must be YYYY-MM-DD.json'); continue; }
  const data = readJson(file);
  if (!data) continue;
  if (!validateNews(data)) reportAjv(file, validateNews);

  // Cross-file checks (run even if the schema failed, as far as the shape allows)
  if (data.date !== undefined && data.date !== m[1]) err(file, '/date', `"${data.date}" does not match filename date "${m[1]}"`);
  const ids = new Set();
  if (!Array.isArray(data.articles)) continue;
  data.articles.forEach((a, i) => {
    if (!a || typeof a !== 'object') return;
    const p = `/articles/${i}`;
    if (ids.has(a.id)) err(file, `${p}/id`, `duplicate id "${a.id}"`);
    ids.add(a.id);
    if (topicSlugs.size && !topicSlugs.has(a.topic))
      err(file, `${p}/topic`, `unknown topic "${a.topic}" (allowed: ${[...topicSlugs].join(', ')})`);
  });
  articleCount += data.articles.length;
}

if (errors.length) {
  console.error(`\nValidation failed with ${errors.length} error(s):\n`);
  console.error(errors.join('\n'));
  console.error('');
  process.exit(1);
}
console.log(`✓ Data is valid — ${topicSlugs.size} topics, ${files.length} edition(s), ${articleCount} article(s).`);
