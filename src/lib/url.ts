/** Prefix an internal path with the configured base (GitHub Pages project sites live under /<repo>/). */
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}` || '/';
}

/** Internal page for one story: /day/<edition date>/<article id>/ */
export const storyUrl = (date: string, id: string) => url(`/day/${date}/${id}/`);

/** "https://www.geekwire.com/2026/…" → "geekwire.com" */
export const domainOf = (href: string) => new URL(href).hostname.replace(/^www\./, '');
