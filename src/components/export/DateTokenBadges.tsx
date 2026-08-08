import { useMemo } from 'react';
import {
  DATE_TOKENS,
  formatDateToken,
  type DateTokenLabel,
} from '@/services/file/dateTokens';

interface DateTokenBadgesProps {
  onSelect: (label: DateTokenLabel) => void;
}

export function DateTokenBadges({ onSelect }: Readonly<DateTokenBadgesProps>) {
  const tokens = useMemo(
    () =>
      DATE_TOKENS.map(({ label }) => ({
        label,
        value: formatDateToken(label),
      })),
    [],
  );

  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {tokens.map(({ label, value }) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(label)}
          className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          aria-label={`Insertar ${label}`}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
