import { Link } from '@/components/NavLink';
import { Button } from '@/components/ui';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center animate-fade-in">
      <span className="text-6xl" aria-hidden>
        🧭
      </span>
      <h1 className="text-2xl font-semibold text-surface-900 dark:text-surface-100">
        Página não encontrada
      </h1>
      <p className="max-w-sm text-sm text-surface-500 dark:text-surface-400">
        O endereço que você acessou não existe ou foi movido.
      </p>
      <Link to="/">
        <Button leftIcon={<Home className="h-4 w-4" />}>Voltar ao início</Button>
      </Link>
    </div>
  );
}
