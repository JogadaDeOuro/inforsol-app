import { cn } from '@/lib/utils';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const SIGNATURE_FONTS = [
  { name: 'Dancing Script', family: 'Dancing Script' },
  { name: 'Great Vibes', family: 'Great Vibes' },
  { name: 'Pacifico', family: 'Pacifico' },
  { name: 'Sacramento', family: 'Sacramento' },
  { name: 'Allura', family: 'Allura' },
  { name: 'Satisfy', family: 'Satisfy' },
];

interface SignatureStylePickerProps {
  name: string;
  selectedFont: string;
  onSelectFont: (font: string) => void;
}

export function SignatureStylePicker({ name, selectedFont, onSelectFont }: SignatureStylePickerProps) {
  const displayName = name.trim() || 'Seu Nome';

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Escolha o estilo da assinatura:</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {SIGNATURE_FONTS.map((font) => (
          <button
            key={font.name}
            type="button"
            onClick={() => onSelectFont(font.family)}
            className={cn(
              'rounded-lg border-2 p-3 text-center transition-all hover:border-primary/50 hover:bg-primary/5 cursor-pointer min-h-[60px] flex items-center justify-center',
              selectedFont === font.family
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-border bg-card'
            )}
          >
            <span
              style={{ fontFamily: font.family }}
              className="text-lg text-foreground leading-tight break-all"
            >
              {displayName}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export { SIGNATURE_FONTS };
