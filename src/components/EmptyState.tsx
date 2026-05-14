import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6 rounded-xl border border-dashed border-border/70 bg-gradient-subtle',
        className
      )}
    >
      {icon && (
        <div className="h-14 w-14 rounded-2xl bg-gradient-primary text-primary-foreground flex items-center justify-center mb-4 shadow-glow">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold font-display">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mt-1">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-5">
          {action.label}
        </Button>
      )}
    </div>
  );
}