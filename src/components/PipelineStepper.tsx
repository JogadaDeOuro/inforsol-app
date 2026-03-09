import { motion } from 'framer-motion';
import { Check, UserPlus, Headphones, Send, Handshake, ShieldCheck, Wrench, Flag, XCircle, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PipelineStatus =
  | 'novo' | 'em_atendimento' | 'proposta_enviada' | 'negociacao'
  | 'fechado' | 'instalacao' | 'finalizado' | 'perdido' | 'arquivado';

const pipelineSteps: { key: PipelineStatus; label: string; icon: React.ElementType }[] = [
  { key: 'novo', label: 'Novo', icon: UserPlus },
  { key: 'em_atendimento', label: 'Atendimento', icon: Headphones },
  { key: 'proposta_enviada', label: 'Proposta', icon: Send },
  { key: 'negociacao', label: 'Negociação', icon: Handshake },
  { key: 'fechado', label: 'Fechado', icon: ShieldCheck },
  { key: 'instalacao', label: 'Instalação', icon: Wrench },
  { key: 'finalizado', label: 'Finalizado', icon: Flag },
];

const mainOrder = pipelineSteps.map(s => s.key);

function getStepIndex(status: PipelineStatus) {
  const idx = mainOrder.indexOf(status);
  return idx === -1 ? -1 : idx;
}

interface PipelineStepperProps {
  currentStatus: PipelineStatus;
  compact?: boolean;
}

export function PipelineStepper({ currentStatus, compact }: PipelineStepperProps) {
  const currentIdx = getStepIndex(currentStatus);
  const isTerminal = currentStatus === 'perdido' || currentStatus === 'arquivado';

  return (
    <div className="w-full">
      <div className={cn('flex items-center gap-0', compact ? 'gap-0' : 'gap-0')}>
        {pipelineSteps.map((step, i) => {
          const Icon = step.icon;
          const isCompleted = !isTerminal && currentIdx > i;
          const isCurrent = currentStatus === step.key;
          const isFuture = !isTerminal && currentIdx < i;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <motion.div
                  className={cn(
                    'rounded-full flex items-center justify-center border-2 transition-colors',
                    compact ? 'h-7 w-7' : 'h-9 w-9',
                    isCompleted && 'bg-primary border-primary text-primary-foreground',
                    isCurrent && 'bg-primary/15 border-primary text-primary ring-2 ring-primary/20',
                    isFuture && 'bg-muted border-border text-muted-foreground',
                    isTerminal && 'bg-muted border-border text-muted-foreground',
                  )}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  whileHover={{ scale: 1.15 }}
                >
                  {isCompleted ? (
                    <Check className={cn(compact ? 'h-3 w-3' : 'h-4 w-4')} />
                  ) : (
                    <Icon className={cn(compact ? 'h-3 w-3' : 'h-4 w-4')} />
                  )}
                </motion.div>
                {!compact && (
                  <span className={cn(
                    'text-[9px] font-medium text-center leading-tight max-w-[60px]',
                    isCurrent ? 'text-primary font-semibold' : 'text-muted-foreground',
                  )}>
                    {step.label}
                  </span>
                )}
              </div>
              {i < pipelineSteps.length - 1 && (
                <div className="flex-1 mx-1">
                  <div className="h-0.5 w-full bg-border relative overflow-hidden rounded-full">
                    {isCompleted && (
                      <motion.div
                        className="absolute inset-0 bg-primary rounded-full"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
                        style={{ transformOrigin: 'left' }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isTerminal && (
        <motion.div
          className="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-md bg-destructive/10 text-destructive text-xs font-medium"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {currentStatus === 'perdido' ? <XCircle className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
          {currentStatus === 'perdido' ? 'Cliente Perdido' : 'Arquivado'}
        </motion.div>
      )}
    </div>
  );
}

export { pipelineSteps, mainOrder, getStepIndex };
