import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Button, Input } from '@/components/ui';
import { ROOM_COLORS, ROOM_ICONS, roomSwatch } from './roomConstants';

const schema = z.object({
  name: z
    .string()
    .min(1, 'Dê um nome ao ambiente.')
    .max(40, 'Máximo de 40 caracteres.'),
  icon: z.string().min(1),
  color: z.string().min(1),
});

type RoomFormValues = z.infer<typeof schema>;

interface RoomDialogProps {
  open: boolean;
  onClose: () => void;
  /** Omit for create mode; pass a room for edit mode. */
  room?: { name: string; icon: string; color: string } | null;
  title: string;
  submitLabel: string;
  isSubmitting?: boolean;
  serverError?: string | null;
  onSubmit: (values: RoomFormValues) => void;
}

/**
 * Shared create/edit form for a room. The same form is reused for both
 * flows; the parent controls the title, submit label, and whether a room
 * is being edited (prefilled defaults).
 */
export function RoomDialog({
  open,
  onClose,
  room,
  title,
  submitLabel,
  isSubmitting = false,
  serverError = null,
  onSubmit,
}: RoomDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', icon: 'home', color: 'primary' },
  });

  // Sync defaults when the dialog opens or the target room changes.
  useEffect(() => {
    if (open) {
      reset({
        name: room?.name ?? '',
        icon: room?.icon ?? 'home',
        color: room?.color ?? 'primary',
      });
    }
  }, [open, room, reset]);

  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="Organize seus itens por cômodo"
      size="md"
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            size="md"
            isLoading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Nome do ambiente"
          placeholder="Ex.: Cozinha, Sala, Quarto"
          error={errors.name?.message}
          autoFocus
          {...register('name')}
        />

        {/* Icon picker */}
        <div>
          <p className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-200">
            Ícone
          </p>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {ROOM_ICONS.map((preset) => {
              const Icon = preset.Icon;
              const active = selectedIcon === preset.key;
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => setValue('icon', preset.key, { shouldDirty: true })}
                  aria-pressed={active}
                  title={preset.label}
                  className={
                    'flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ' +
                    (active
                      ? 'border-primary-400 bg-primary-50 text-primary-600 dark:border-primary-500 dark:bg-primary-900/40 dark:text-primary-300'
                      : 'border-surface-200 text-surface-500 hover:bg-surface-100 dark:border-surface-700 dark:hover:bg-surface-800')
                  }
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Color picker */}
        <div>
          <p className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-200">
            Cor
          </p>
          <div className="flex flex-wrap gap-2.5">
            {ROOM_COLORS.map((preset) => {
              const active = selectedColor === preset.key;
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => setValue('color', preset.key, { shouldDirty: true })}
                  aria-pressed={active}
                  aria-label={preset.label}
                  title={preset.label}
                  className={
                    'flex h-9 w-9 items-center justify-center rounded-full transition-all ' +
                    roomSwatch(preset.key) +
                    (active
                      ? ' ring-2 ring-offset-2 ring-offset-white ring-surface-400 dark:ring-offset-surface-900'
                      : ' hover:scale-110')
                  }
                >
                  {active && (
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" aria-hidden>
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {serverError && (
          <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-danger-950 dark:text-danger-300">
            {serverError}
          </p>
        )}

        {/* Hidden submit so Enter works; visible button is in the modal footer. */}
        <button type="submit" className="hidden" aria-hidden />
      </form>
    </Modal>
  );
}
