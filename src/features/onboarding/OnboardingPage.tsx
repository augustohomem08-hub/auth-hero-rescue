import { useState } from 'react';
import { Navigate, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Home, KeyRound, Plus, Sparkles, CalendarDays, Building2, Hammer, Ticket } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { createProject, joinProjectByCode } from '@/lib/project';
import { queryClient } from '@/lib/queryClient';

type Tab = 'create' | 'join';

const createSchema = z.object({
  name: z.string().min(1, 'Dê um nome ao seu lar.').max(80, 'Máximo de 80 caracteres.'),
  apartmentName: z.string().min(1, 'Informe o nome do apartamento.').max(80, 'Máximo de 80 caracteres.'),
  builderName: z.string().max(80, 'Máximo de 80 caracteres.').optional().or(z.literal('')),
  expectedDeliveryDate: z
    .string()
    .optional()
    .refine(
      (v) => !v || !Number.isNaN(Date.parse(v)),
      'Data inválida.'
    ),
});

type CreateForm = z.infer<typeof createSchema>;

const joinSchema = z.object({
  code: z
    .string()
    .min(1, 'Digite o código de convite.')
    .max(20, 'Código muito longo.')
    .refine((v) => /^[A-Z0-9-]+$/i.test(v.trim()), 'Use apenas letras, números e traços.'),
});

type JoinForm = z.infer<typeof joinSchema>;

export function OnboardingPage() {
  const [tab, setTab] = useState<Tab>('create');
  const { user, status } = useAuth();
  const navigate = useNavigate();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="animate-pulse text-sm text-surface-400">Carregando…</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/entrar" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4 py-10 dark:bg-surface-950">
      <div className="w-full max-w-md animate-slide-up">
        {/* Brand mark */}
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-soft">
            <Home className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold text-surface-900 dark:text-surface-100">
            Nosso Primeiro Lar
          </h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            {user?.email ? `Olá, ${user.email}` : 'Bem-vindo!'} Que tal começar a organizar seu lar?
          </p>
        </div>

        {/* Tab switcher */}
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-surface-100 p-1 dark:bg-surface-800">
          <TabButton active={tab === 'create'} onClick={() => setTab('create')} icon={<Plus className="h-4 w-4" />}>
            Criar projeto
          </TabButton>
          <TabButton active={tab === 'join'} onClick={() => setTab('join')} icon={<KeyRound className="h-4 w-4" />}>
            Entrar com código
          </TabButton>
        </div>

        {tab === 'create' ? (
          <CreateProjectForm onDone={() => navigate('/')} />
        ) : (
          <JoinProjectForm onDone={() => navigate('/')} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ' +
        (active
          ? 'bg-white text-primary-700 shadow-soft dark:bg-surface-900 dark:text-primary-300'
          : 'text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200')
      }
    >
      {icon}
      {children}
    </button>
  );
}

function CreateProjectForm({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', apartmentName: '', builderName: '', expectedDeliveryDate: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    if (!user) {
      setServerError('Você precisa estar autenticado.');
      return;
    }
    const { project, error } = await createProject({
      name: values.name,
      apartmentName: values.apartmentName,
      builderName: values.builderName || null,
      expectedDeliveryDate: values.expectedDeliveryDate || null,
      ownerUserId: user.id,
    });
    if (error || !project) {
      setServerError(error ?? 'Não foi possível criar o projeto.');
      return;
    }
    setCreatedCode(project.invitation_code);
    await queryClient.invalidateQueries({ queryKey: ['projects'] });
  });

  if (createdCode) {
    return (
      <Card padding="lg" className="animate-scale-in">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success-100 text-success-600 dark:bg-success-900/40 dark:text-success-300">
            <Sparkles className="h-6 w-6" />
          </span>
          <h2 className="mt-3 text-lg font-semibold text-surface-900 dark:text-surface-100">
            Projeto criado!
          </h2>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Compartilhe este código com quem você quer convidar.
          </p>
          <div className="mt-4 w-full rounded-xl border border-dashed border-surface-300 bg-surface-50 px-4 py-3 text-center dark:border-surface-700 dark:bg-surface-800">
            <p className="text-xs uppercase tracking-wide text-surface-500 dark:text-surface-400">
              Código de convite
            </p>
            <p className="mt-1 font-mono text-xl font-semibold tracking-widest text-primary-700 dark:text-primary-300">
              {createdCode}
            </p>
          </div>
          <Button fullWidth className="mt-5" onClick={onDone} rightIcon={<Home className="h-4 w-4" />}>
            Ir para o início
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Nome do projeto"
          placeholder="Ex.: Nosso primeiro lar"
          leftIcon={<Home className="h-4 w-4" />}
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Nome do apartamento"
          placeholder="Ex.: Residencial Jardim Botânico — Apto 1204"
          leftIcon={<Building2 className="h-4 w-4" />}
          error={errors.apartmentName?.message}
          {...register('apartmentName')}
        />
        <Input
          label="Construtora (opcional)"
          placeholder="Ex.: Construtora XYZ"
          leftIcon={<Hammer className="h-4 w-4" />}
          error={errors.builderName?.message}
          {...register('builderName')}
        />
        <Input
          label="Data prevista de entrega (opcional)"
          type="date"
          leftIcon={<CalendarDays className="h-4 w-4" />}
          error={errors.expectedDeliveryDate?.message}
          {...register('expectedDeliveryDate')}
        />

        {serverError && (
          <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-danger-950 dark:text-danger-300">
            {serverError}
          </p>
        )}

        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} leftIcon={<Plus className="h-4 w-4" />}>
          Criar projeto
        </Button>
        <p className="text-center text-xs text-surface-400 dark:text-surface-500">
          Um código de convite único será gerado automaticamente.
        </p>
      </form>
    </Card>
  );
}

function JoinProjectForm({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JoinForm>({
    resolver: zodResolver(joinSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    if (!user) {
      setServerError('Você precisa estar autenticado.');
      return;
    }
    const { error } = await joinProjectByCode({ code: values.code, userId: user.id });
    if (error) {
      setServerError(error);
      return;
    }
    setSuccess(true);
    await queryClient.invalidateQueries({ queryKey: ['projects'] });
  });

  if (success) {
    return (
      <Card padding="lg" className="animate-scale-in">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success-100 text-success-600 dark:bg-success-900/40 dark:text-success-300">
            <Sparkles className="h-6 w-6" />
          </span>
          <h2 className="mt-3 text-lg font-semibold text-surface-900 dark:text-surface-100">
            Tudo certo!
          </h2>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Você entrou no projeto. Bem-vindo ao lar compartilhado.
          </p>
          <Button fullWidth className="mt-5" onClick={onDone} rightIcon={<Home className="h-4 w-4" />}>
            Ir para o início
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Código de convite"
          placeholder="Ex.: K7Q4-9P2D"
          leftIcon={<Ticket className="h-4 w-4" />}
          autoComplete="off"
          autoCapitalize="characters"
          className="font-mono uppercase tracking-widest"
          error={errors.code?.message}
          {...register('code')}
        />

        {serverError && (
          <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-danger-950 dark:text-danger-300">
            {serverError}
          </p>
        )}

        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} leftIcon={<KeyRound className="h-4 w-4" />}>
          Entrar no projeto
        </Button>
        <p className="text-center text-xs text-surface-400 dark:text-surface-500">
          Peça o código ao dono do projeto que você quer participar.
        </p>
      </form>
    </Card>
  );
}
