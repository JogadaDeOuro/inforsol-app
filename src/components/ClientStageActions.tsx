import { ChevronRight, XCircle, Archive, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { type PipelineStatus, mainOrder, getStepIndex, pipelineSteps } from './PipelineStepper';

interface ClientStageActionsProps {
  currentStatus: PipelineStatus;
  onChangeStatus: (newStatus: PipelineStatus) => void;
  compact?: boolean;
}

export function ClientStageActions({ currentStatus, onChangeStatus, compact }: ClientStageActionsProps) {
  const currentIdx = getStepIndex(currentStatus);
  const isTerminal = currentStatus === 'perdido' || currentStatus === 'arquivado';

  // Next logical step
  const nextStatus = currentIdx >= 0 && currentIdx < mainOrder.length - 1
    ? mainOrder[currentIdx + 1]
    : null;

  const nextLabel = nextStatus
    ? pipelineSteps.find(s => s.key === nextStatus)?.label
    : null;

  return (
    <div className="flex items-center gap-2">
      {/* Quick advance button */}
      {nextStatus && !isTerminal && (
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button
            size={compact ? 'sm' : 'default'}
            className="gap-1.5"
            onClick={() => onChangeStatus(nextStatus)}
          >
            <ArrowRight className="h-3.5 w-3.5" />
            {!compact && <span>Avançar para {nextLabel}</span>}
            {compact && <span>{nextLabel}</span>}
          </Button>
        </motion.div>
      )}

      {/* Full dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" size={compact ? 'sm' : 'default'} className="gap-1.5">
              <ChevronRight className="h-3.5 w-3.5" />
              {!compact && 'Mover para...'}
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {pipelineSteps
            .filter(s => s.key !== currentStatus)
            .map(step => {
              const Icon = step.icon;
              return (
                <DropdownMenuItem key={step.key} onClick={() => onChangeStatus(step.key)} className="gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  {step.label}
                </DropdownMenuItem>
              );
            })}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onChangeStatus('perdido')}
            className="gap-2 text-destructive focus:text-destructive"
            disabled={currentStatus === 'perdido'}
          >
            <XCircle className="h-3.5 w-3.5" /> Perdido
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onChangeStatus('arquivado')}
            className="gap-2 text-muted-foreground"
            disabled={currentStatus === 'arquivado'}
          >
            <Archive className="h-3.5 w-3.5" /> Arquivar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
