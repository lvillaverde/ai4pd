/** Turn a YouTube or Vimeo page URL into an embeddable player URL; undefined for anything else. */
export function videoEmbedUrl(href: string): string | undefined {
  let u: URL;
  try { u = new URL(href); } catch { return undefined; }
  const host = u.hostname.replace(/^(www|m)\./, '');
  let id: string | null | undefined;
  if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
  else if (host === 'youtube.com') {
    id = u.searchParams.get('v') ?? u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{6,})/)?.[1];
  }
  if (id && /^[\w-]{6,}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
  if (host === 'vimeo.com') {
    const vid = u.pathname.match(/^\/(\d+)/)?.[1];
    if (vid) return `https://player.vimeo.com/video/${vid}?dnt=1`;
  }
  return undefined;
}

export const formatDuration = (min?: number) =>
  !min ? undefined : min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60 ? `${min % 60} min` : ''}`.trim();
