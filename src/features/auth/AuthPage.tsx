import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Home, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';

type Tab = 'signin' | 'signup';

const signinSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'Digite sua senha.'),
});

const signupSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

type SigninForm = z.infer<typeof signinSchema>;
type SignupForm = z.infer<typeof signupSchema>;

export function AuthPage() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('signin');

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="animate-pulse text-sm text-surface-400">Carregando…</div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
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
            {tab === 'signin' ? 'Entre para continuar.' : 'Crie sua conta para começar.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-surface-100 p-1 dark:bg-surface-800">
          <TabButton active={tab === 'signin'} onClick={() => setTab('signin')} icon={<LogIn className="h-4 w-4" />}>
            Entrar
          </TabButton>
          <TabButton active={tab === 'signup'} onClick={() => setTab('signup')} icon={<UserPlus className="h-4 w-4" />}>
            Cadastrar
          </TabButton>
        </div>

        {tab === 'signin' ? (
          <SignInForm onDone={() => navigate('/')} onSwitchToSignup={() => setTab('signup')} />
        ) : (
          <SignUpForm onDone={() => navigate('/')} onSwitchToSignin={() => setTab('signin')} />
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

function SignInForm({
  onDone,
  onSwitchToSignup,
}: {
  onDone: () => void;
  onSwitchToSignup: () => void;
}) {
  const { signIn } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninForm>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const { error } = await signIn(values.email, values.password);
    if (error) {
      setServerError(error);
      return;
    }
    onDone();
  });

  return (
    <Card padding="lg">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="E-mail"
          type="email"
          placeholder="voce@email.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          autoComplete="email"
          autoFocus
          {...register('email')}
        />
        <Input
          label="Senha"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          autoComplete="current-password"
          {...register('password')}
        />

        {serverError && (
          <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-danger-950 dark:text-danger-300">
            {serverError}
          </p>
        )}

        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} leftIcon={<LogIn className="h-4 w-4" />}>
          Entrar
        </Button>

        <p className="text-center text-sm text-surface-400 dark:text-surface-500">
          Não tem conta?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Cadastre-se
          </button>
        </p>
      </form>
    </Card>
  );
}

function SignUpForm({
  onDone,
  onSwitchToSignin,
}: {
  onDone: () => void;
  onSwitchToSignin: () => void;
}) {
  const { signUp } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const { error } = await signUp(values.email, values.password);
    if (error) {
      setServerError(error);
      return;
    }
    setSuccess(true);
  });

  if (success) {
    return (
      <Card padding="lg" className="animate-scale-in">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success-100 text-success-600 dark:bg-success-900/40 dark:text-success-300">
            <UserPlus className="h-6 w-6" />
          </span>
          <h2 className="mt-3 text-lg font-semibold text-surface-900 dark:text-surface-100">
            Conta criada!
          </h2>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Você já pode entrar e criar seu projeto.
          </p>
          <Button fullWidth className="mt-5" onClick={onDone} leftIcon={<LogIn className="h-4 w-4" />}>
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
          label="E-mail"
          type="email"
          placeholder="voce@email.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          autoComplete="email"
          autoFocus
          {...register('email')}
        />
        <Input
          label="Senha"
          type="password"
          placeholder="Mínimo 6 caracteres"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          autoComplete="new-password"
          {...register('password')}
        />

        {serverError && (
          <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-danger-950 dark:text-danger-300">
            {serverError}
          </p>
        )}

        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} leftIcon={<UserPlus className="h-4 w-4" />}>
          Criar conta
        </Button>

        <p className="text-center text-sm text-surface-400 dark:text-surface-500">
          Já tem conta?{' '}
          <button
            type="button"
            onClick={onSwitchToSignin}
            className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Entrar
          </button>
        </p>
      </form>
    </Card>
  );
}
