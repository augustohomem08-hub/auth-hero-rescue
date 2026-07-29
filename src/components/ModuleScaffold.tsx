import type { ReactNode } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardHeader, EmptyState } from '@/components/ui';
import { Sparkles } from 'lucide-react';

export interface ModuleScaffoldProps {
  emoji: string;
  title: string;
  description: string;
  /** Short list of capabilities planned for this module. */
  plannedFeatures: string[];
  action?: ReactNode;
}

/**
 * Shared placeholder for modules that have not been implemented yet.
 * Shows the module identity + the planned feature list, so the structure is visible.
 */
export function ModuleScaffold({
  emoji,
  title,
  description,
  plannedFeatures,
  action,
}: ModuleScaffoldProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader emoji={emoji} title={title} description={description} action={action} />

      <Card>
        <CardHeader
          title="Em construção"
          subtitle="A estrutura deste módulo já está pronta — as funcionalidades chegaram em breve."
        />
        <div className="mt-4">
          <EmptyState
            icon={<Sparkles className="h-7 w-7" />}
            title="Funcionalidades em breve"
            description="Este módulo faz parte da fundação do app. Os recursos serão ativados nas próximas etapas."
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="O que está planejado" subtitle="Funcionalidades previstas para este módulo" />
        <ul className="mt-4 space-y-2">
          {plannedFeatures.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2.5 rounded-xl bg-surface-50 px-3.5 py-2.5 text-sm text-surface-700 dark:bg-surface-800/60 dark:text-surface-200"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary-400" aria-hidden />
              {feature}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
