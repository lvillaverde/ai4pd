import { siteConfig } from '../site.config';

const { locale, timezone } = siteConfig;

/** "2026-10-19" → Date at noon UTC (avoids timezone day shifts for date-only values). */
const fromDay = (day: string) => new Date(`${day}T12:00:00Z`);

export const formatLongDate = (day: string) =>
  new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(fromDay(day));

export const formatShortDate = (day: string) =>
  new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(fromDay(day));

export const formatMonth = (day: string) =>
  new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(fromDay(day));

export const formatTime = (iso: string) =>
  new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', timeZone: timezone, timeZoneName: 'short' }).format(new Date(iso));

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: timezone }).format(new Date(iso));

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
