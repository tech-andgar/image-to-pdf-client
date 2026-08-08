// Temporal is available natively in Chrome 109+, Safari 16.4+, Firefox 139+
// Declared here to satisfy TypeScript without adding a runtime polyfill
declare namespace Temporal {
  interface PlainDateTime {
    readonly year: number;
    readonly month: number;
    readonly day: number;
    readonly hour: number;
    readonly minute: number;
  }
  namespace Now {
    function plainDateTimeISO(): PlainDateTime;
  }
}

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
  const dt = Temporal.Now.plainDateTimeISO();
  return {
    Y: String(dt.year),
    M: pad(dt.month),
    D: pad(dt.day),
    H: pad(dt.hour),
    min: pad(dt.minute),
    jsDate: new Date(dt.year, dt.month - 1, dt.day),
  };
}

export function formatDateToken(
  label: DateTokenLabel,
  locale = navigator.language,
): string {
  const token = DATE_TOKENS.find((t) => t.label === label);
  if (!token) return label;
  return token.format(buildDateParts(), locale);
}
