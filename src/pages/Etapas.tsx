import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockProjectStages, type StageStatus } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Clock, AlertTriangle, ChevronRight } from 'lucide-react';

const stageIcons: Record<StageStatus, typeof CheckCircle2> = {
  concluido: CheckCircle2,
  em_andamento: Clock,
  pendente: Circle,
  atrasado: AlertTriangle,
};

const stageColors: Record<StageStatus, string> = {
  concluido: 'text-success',
  em_andamento: 'text-info',
  pendente: 'text-muted-foreground',
  atrasado: 'text-destructive',
};

const stageBgColors: Record<StageStatus, string> = {
  concluido: 'bg-success/10 border-success/30',
  em_andamento: 'bg-info/10 border-info/30',
  pendente: 'bg-muted border-border',
  atrasado: 'bg-destructive/10 border-destructive/30',
};

function getDaysDiff(date1: string, date2?: string): number {
  const d1 = new Date(date1);
  const d2 = date2 ? new Date(date2) : new Date();
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export default function Etapas() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Gestão de Etapas & Prazos</h1>
        <p className="text-sm text-muted-foreground">Acompanhe o andamento de cada projeto</p>
      </div>

      {mockProjectStages.map((project) => {
        const currentStageIdx = project.stages.findIndex(
          s => s.status === 'em_andamento' || s.status === 'atrasado'
        );
        const progress = project.stages.filter(s => s.status === 'concluido').length;

        return (
          <Card key={project.id} className="animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{project.clientName}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {progress}/{project.stages.length} etapas
                </Badge>
              </div>
              {/* Progress bar */}
              <div className="h-2 rounded-full bg-muted overflow-hidden mt-2">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(progress / project.stages.length) * 100}%` }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.stages.map((stage, i) => {
                  const Icon = stageIcons[stage.status];
                  const daysDiff = stage.dataReal
                    ? getDaysDiff(stage.dataPrevista, stage.dataReal)
                    : stage.status === 'atrasado'
                    ? getDaysDiff(stage.dataPrevista)
                    : 0;

                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border p-3 transition-all',
                        stageBgColors[stage.status]
                      )}
                    >
                      <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', stageColors[stage.status])} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{stage.name}</p>
                          {stage.status === 'concluido' && daysDiff < 0 && (
                            <Badge className="bg-success/20 text-success text-[10px]">
                              {Math.abs(daysDiff)} dias antecipado
                            </Badge>
                          )}
                          {stage.status === 'concluido' && daysDiff === 0 && (
                            <Badge className="bg-info/20 text-info text-[10px]">No prazo</Badge>
                          )}
                          {stage.status === 'atrasado' && (
                            <Badge className="bg-destructive/20 text-destructive text-[10px]">
                              {daysDiff} dias atrasado
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                          <span>Previsto: {stage.dataPrevista}</span>
                          {stage.dataReal && <span>Real: {stage.dataReal}</span>}
                          <span>Resp: {stage.responsavel}</span>
                        </div>
                        {stage.observacoes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">{stage.observacoes}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
