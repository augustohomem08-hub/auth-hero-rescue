import { useEffect, useState } from 'react';
import { Building2, CalendarDays, Home, Heart, Pencil } from 'lucide-react';
import type { Project } from '@/types/project';
import { formatCountdown, formatDeliveryDate, getCountdown } from '@/lib/dateUtils';
import { getSignedUrl } from '@/lib/storage';

interface ProjectHeroProps {
  project: Project;
  greeting: string;
  /** Opens the "Editar projeto" dialog. */
  onEdit?: () => void;
}

export function ProjectHero({ project, greeting, onEdit }: ProjectHeroProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const countdown = getCountdown(project.expected_delivery_date);

  useEffect(() => {
    let active = true;
    if (project.cover_image) {
      getSignedUrl('images', project.cover_image)
        .then((url) => {
          if (active) setCoverUrl(url);
        })
        .catch(() => {
          if (active) setCoverUrl(null);
        });
    }
    return () => {
      active = false;
    };
  }, [project.cover_image]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-surface-200/60 bg-surface-900 shadow-card dark:border-surface-800">
      {/* Cover image / fallback gradient */}
      <div className="relative h-44 w-full sm:h-56">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={project.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950/85 via-surface-950/30 to-transparent" />

        {/* Greeting + heart accent */}
        <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
          <p className="text-sm font-medium text-white/90">{greeting}</p>
        </div>
        <Heart className="absolute right-5 top-5 h-16 w-16 text-white/15" aria-hidden />

        {/* Project identity */}
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-6 sm:right-6">
          <div className="flex items-center gap-2 text-white/80">
            <Home className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Projeto</span>
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                aria-label="Editar projeto"
                className="rounded-lg p-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <h2 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">{project.name}</h2>
        </div>
      </div>

      {/* Meta strip */}
      <div className="grid grid-cols-1 divide-y divide-surface-800 px-4 py-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6">
        <MetaItem
          icon={<Building2 className="h-4 w-4" />}
          label="Apartamento"
          value={project.apartment_name || 'Não informado'}
        />
        <MetaItem
          icon={<CalendarDays className="h-4 w-4" />}
          label="Entrega prevista"
          value={formatDeliveryDate(project.expected_delivery_date)}
        />
        <MetaItem
          icon={<CountdownIcon days={countdown.days} isPast={countdown.isPast} />}
          label="Contagem"
          value={formatCountdown(project.expected_delivery_date)}
          highlight={!countdown.isPast && countdown.isValid}
        />
      </div>
    </div>
  );
}

function MetaItem({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-0 py-3 sm:px-4 sm:py-0 sm:first:pl-0 sm:last:pr-0">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-900/40 text-primary-200">
        {icon}
      </span>
      <div className="min-w-0">
        {/* The meta strip always sits on the dark hero surface, so its text
            colors are intentionally theme-independent. */}
        <p className="text-xs uppercase tracking-wide text-surface-400">{label}</p>
        <p
          className={
            'truncate text-sm font-medium ' +
            (highlight ? 'text-primary-300' : 'text-surface-100')
          }
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function CountdownIcon({ days, isPast }: { days: number; isPast: boolean }) {
  // Simple inline clock-like indicator; color shifts with urgency.
  const urgent = !isPast && days >= 0 && days <= 30;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2"
        className={urgent ? 'text-warning-500' : ''}
      />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
