import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Mail, User as UserIcon } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Button, Card, CardHeader, Input } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { upsertOwnProfile } from '@/lib/profiles';
import { formatDate } from '@/lib/utils';

/**
 * Profile and account page. The display name lives in the Supabase auth user
 * metadata (`display_name`) — there is no separate profiles table, so we read
 * and write it directly on the authenticated user.
 */
export function PerfilPage() {
  const { user } = useAuth();
  const metaName =
    (user?.user_metadata?.['display_name'] as string | undefined) ??
    (user?.user_metadata?.['full_name'] as string | undefined) ??
    '';

  const [name, setName] = useState(metaName);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => setName(metaName), [metaName]);

  const save = async () => {
    setSaving(true);
    setFeedback(null);
    const { error } = await supabase.auth.updateUser({
      data: { display_name: name.trim() },
    });
    if (!error && user) {
      await upsertOwnProfile({
        id: user.id,
        displayName: name.trim(),
        email: user.email ?? null,
      });
    }
    setSaving(false);
    setFeedback(
      error
        ? { tone: 'error', text: error.message }
        : { tone: 'ok', text: 'Perfil atualizado com sucesso.' }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        to="/configuracoes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar para Configurações
      </Link>

      <PageHeader
        emoji="👤"
        title="Perfil e conta"
        description="Seu nome de exibição e os dados da sua conta."
      />

      <Card>
        <CardHeader title="Nome de exibição" subtitle="Como você aparece para o casal" />
        <div className="mt-4 space-y-4">
          <Input
            label="Nome"
            placeholder="Ex.: Augusto"
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<UserIcon className="h-4 w-4" />}
          />
          {feedback && (
            <p
              role="status"
              className={
                feedback.tone === 'ok'
                  ? 'rounded-lg border border-success-300 bg-success-100 px-3 py-2 text-sm font-medium text-success-900 dark:border-success-700 dark:bg-success-900/40 dark:text-success-100'
                  : 'rounded-lg border border-danger-300 bg-danger-100 px-3 py-2 text-sm font-medium text-danger-900 dark:border-danger-700 dark:bg-danger-900/40 dark:text-danger-100'
              }
            >
              {feedback.text}
            </p>
          )}
          <Button onClick={save} isLoading={saving} disabled={!name.trim()}>
            Salvar alterações
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Conta" subtitle="Dados de acesso" />
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400">
              <Mail className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <dt className="text-xs text-surface-500 dark:text-surface-400">E-mail</dt>
              <dd className="truncate font-medium text-surface-900 dark:text-surface-100">
                {user?.email ?? '—'}
              </dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400">
              <UserIcon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <dt className="text-xs text-surface-500 dark:text-surface-400">Conta criada em</dt>
              <dd className="truncate font-medium text-surface-900 dark:text-surface-100">
                {user?.created_at ? formatDate(user.created_at) : '—'}
              </dd>
            </div>
          </div>
        </dl>
      </Card>
    </div>
  );
}
