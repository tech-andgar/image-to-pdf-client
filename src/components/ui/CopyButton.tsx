import { CheckSquare, Copy } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({
  text,
  label = 'Copiar',
  className = '',
}: Readonly<CopyButtonProps>) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className={`flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ${className}`}
    >
      {copied ? (
        <>
          <CheckSquare className="h-3.5 w-3.5" />
          Copiado
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {label}
        </>
      )}
    </button>
  );
}
