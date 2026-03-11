import '@fontsource/dancing-script/400.css';
import '@fontsource/great-vibes/400.css';
import '@fontsource/pacifico/400.css';
import '@fontsource/sacramento/400.css';
import '@fontsource/allura/400.css';
import '@fontsource/satisfy/400.css';

import { cn } from '@/lib/utils';

const SIGNATURE_FONTS = [
  { name: 'Dancing Script', family: '"Dancing Script", cursive' },
  { name: 'Great Vibes', family: '"Great Vibes", cursive' },
  { name: 'Pacifico', family: '"Pacifico", cursive' },
  { name: 'Sacramento', family: '"Sacramento", cursive' },
  { name: 'Allura', family: '"Allura", cursive' },
  { name: 'Satisfy', family: '"Satisfy", cursive' },
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
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SIGNATURE_FONTS.map((font) => (
          <button
            key={font.name}
            type="button"
            onClick={() => onSelectFont(font.family)}
            className={cn(
              'min-h-[60px] cursor-pointer rounded-lg border-2 p-3 text-center transition-all hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center',
              selectedFont === font.family ? 'border-primary bg-primary/10 shadow-sm' : 'border-border bg-card'
            )}
          >
            <span style={{ fontFamily: font.family }} className="text-lg text-foreground leading-tight break-all">
              {displayName}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export { SIGNATURE_FONTS };
