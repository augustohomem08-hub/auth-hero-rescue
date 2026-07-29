import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImagePlus, X } from 'lucide-react';
import { Modal, Button, Input, Textarea } from '@/components/ui';

const schema = z.object({
  title: z.string().min(1, 'Dê um título à memória.').max(80, 'Máximo de 80 caracteres.'),
  description: z.string().max(500).optional().or(z.literal('')),
  date: z.string().min(1, 'Informe a data.'),
  is_highlight: z.boolean(),
});

export type MemoryFormValues = z.infer<typeof schema>;

export interface MemorySubmitValues {
  title: string;
  description: string | null;
  date: string;
  is_highlight: boolean;
  file?: File | null;
}

interface MemoryDialogProps {
  open: boolean;
  onClose: () => void;
  initial?: Partial<Omit<MemorySubmitValues, 'file'>> | null;
  title: string;
  submitLabel: string;
  isSubmitting?: boolean;
  serverError?: string | null;
  onSubmit: (values: MemorySubmitValues) => void;
}

export function MemoryDialog({
  open,
  onClose,
  initial,
  title,
  submitLabel,
  isSubmitting = false,
  serverError = null,
  onSubmit,
}: MemoryDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MemoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', date: new Date().toISOString().slice(0, 10), is_highlight: false },
  });

  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      reset({
        title: initial?.title ?? '',
        description: initial?.description ?? '',
        date: initial?.date ?? new Date().toISOString().slice(0, 10),
        is_highlight: initial?.is_highlight ?? false,
      });
      setFile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const isHighlight = watch('is_highlight');

  const submit = (values: MemoryFormValues) => {
    onSubmit({
      title: values.title,
      description: values.description || null,
      date: values.date,
      is_highlight: values.is_highlight,
      file,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="Um momento especial de vocês"
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" size="md" isLoading={isSubmitting} onClick={handleSubmit(submit)}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <Input
          label="Título"
          placeholder="Ex.: Dia do noivado, Primeira visita ao apartamento"
          error={errors.title?.message}
          autoFocus
          {...register('title')}
        />
        <Textarea
          label="Descrição (opcional)"
          placeholder="Contem como foi esse momento…"
          error={errors.description?.message}
          {...register('description')}
        />
        <Input label="Data" type="date" error={errors.date?.message} {...register('date')} />

        {/* Image picker */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-200">
            Foto (opcional)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-surface-300 px-3 py-2.5 dark:border-surface-700">
              <span className="truncate text-sm text-surface-700 dark:text-surface-200">{file.name}</span>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="rounded p-1 text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
                aria-label="Remover foto"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-surface-300 px-3 py-4 text-sm text-surface-500 transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-surface-700 dark:text-surface-400"
            >
              <ImagePlus className="h-4 w-4" /> Escolher foto
            </button>
          )}
        </div>

        {/* Highlight toggle */}
        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            {...register('is_highlight')}
            className="h-4 w-4 rounded border-surface-300 text-primary-500 focus:ring-primary-400 dark:border-surface-600"
          />
          <span className="text-sm text-surface-700 dark:text-surface-200">
            Marcar como momento especial
          </span>
          {isHighlight && (
            <span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
              Destaque
            </span>
          )}
        </label>

        {serverError && (
          <p className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-danger-950 dark:text-danger-300">
            {serverError}
          </p>
        )}
        <button type="submit" className="hidden" aria-hidden />
      </form>
    </Modal>
  );
}
