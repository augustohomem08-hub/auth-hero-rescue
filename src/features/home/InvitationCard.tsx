import { useState } from 'react';
import { Check, Copy, RefreshCw, Ticket, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, Button } from '@/components/ui';
import { regenerateInvitationCode } from '@/lib/project';
import { queryClient } from '@/lib/queryClient';

interface InvitationCardProps {
  projectId: string;
  code: string;
  /** Whether the current user is an owner (can regenerate). */
  canRegenerate: boolean;
}

export function InvitationCard({ projectId, code, canRegenerate }: InvitationCardProps) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [currentCode, setCurrentCode] = useState(code);
  const [error, setError] = useState<string | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Não foi possível copiar.');
    }
  };

  const regenerate = async () => {
    setRegenerating(true);
    setError(null);
    const { code: newCode, error: err } = await regenerateInvitationCode(projectId);
    setRegenerating(false);
    if (err || !newCode) {
      setError(err ?? 'Não foi possível regenerar o código.');
      return;
    }
    setCurrentCode(newCode);
    await queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  return (
    <Card padding="lg">
      <CardHeader
        title="Convite"
        subtitle="Compartilhe o código com quem você quer no lar"
        action={
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300">
            <Ticket className="h-5 w-5" />
          </span>
        }
      />

      <div className="mt-4 rounded-xl border border-dashed border-surface-300 bg-surface-50 px-4 py-4 dark:border-surface-700 dark:bg-surface-800/60">
        <p className="text-xs uppercase tracking-wide text-surface-500 dark:text-surface-400">
          Código de convite
        </p>
        <p className="mt-1.5 font-mono text-2xl font-semibold tracking-[0.2em] text-primary-700 dark:text-primary-300">
          {currentCode}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="md" onClick={copy} leftIcon={
          copied ? <Check className="h-4 w-4 text-success-600" /> : <Copy className="h-4 w-4" />
        }>
          {copied ? 'Copiado!' : 'Copiar código'}
        </Button>

        {canRegenerate && (
          <Button
            variant="ghost"
            size="md"
            onClick={regenerate}
            isLoading={regenerating}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Gerar novo código
          </Button>
        )}
      </div>

      {error && (
        <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-danger-950 dark:text-danger-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {!canRegenerate && (
        <p className="mt-3 text-xs text-surface-400 dark:text-surface-500">
          Apenas o dono pode gerar um novo código.
        </p>
      )}
    </Card>
  );
}
