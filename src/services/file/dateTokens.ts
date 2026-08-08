// ─── Types ────────────────────────────────────────────────────────────────────

interface DateParts {
  Y: string;
  M: string;
  D: string;
  H: string;
  min: string;
  jsDate: Date;
}

type TokenFormatter = (parts: DateParts, locale: string) => string;

// ─── Token definitions ────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, '0');
const intl =
  (opts: Intl.DateTimeFormatOptions): TokenFormatter =>
  (parts, locale) =>
    new Intl.DateTimeFormat(locale, opts).format(parts.jsDate);

export const DATE_TOKENS = [
  { label: 'YYYY-MM-DD', format: ({ Y, M, D }: DateParts) => `${Y}-${M}-${D}` },
  { label: 'YYYYMMDD', format: ({ Y, M, D }: DateParts) => `${Y}${M}${D}` },
  { label: 'YYYY', format: ({ Y }: DateParts) => Y },
  { label: 'MM', format: ({ M }: DateParts) => M },
  { label: 'MMMM', format: intl({ month: 'long' }) },
  { label: 'DD', format: ({ D }: DateParts) => D },
  { label: 'DDDD', format: intl({ weekday: 'long' }) },
  { label: 'HH.MM', format: ({ H, min }: DateParts) => `${H}.${min}` },
] as const satisfies ReadonlyArray<{ label: string; format: TokenFormatter }>;

export type DateTokenLabel = (typeof DATE_TOKENS)[number]['label'];

// ─── Formatter ────────────────────────────────────────────────────────────────

function buildDateParts(): DateParts {
  const now = new Date();
  return {
    Y: String(now.getFullYear()),
    M: pad(now.getMonth() + 1),
    D: pad(now.getDate()),
    H: pad(now.getHours()),
    min: pad(now.getMinutes()),
    jsDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
  };
}

export function formatDateToken(
  label: DateTokenLabel,
  locale = navigator.language || 'en',
): string {
  const token = DATE_TOKENS.find((t) => t.label === label);
  if (!token) return label;
  return token.format(buildDateParts(), locale);
}
