import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Button, Input, Select } from '@/components/ui';
import { DOC_CATEGORIES } from './documentConstants';
import type { DocumentCategory } from '@/types/documentos';

const schema = z.object({
  title: z.string().min(1, 'Dê um título ao documento.').max(80, 'Máximo de 80 caracteres.'),
  category: z.enum([
    'contract',
    'memorial',
    'blueprint',
    'bill',
    'receipt',
    'proof',
    'warranty',
    'manual',
    'certificate',
    'personal',
    'other',
  ]),
  expires_at: z.string().optional().or(z.literal('')),
});

export type DocumentFormValues = z.infer<typeof schema>;

export interface DocumentSubmitValues {
  title: string;
  category: DocumentCategory;
  expires_at: string | null;
}

interface DocumentDialogProps {
  open: boolean;
  onClose: () => void;
  initial?: Partial<DocumentSubmitValues> | null;
  title: string;
  submitLabel: string;
  isSubmitting?: boolean;
  serverError?: string | null;
  onSubmit: (values: DocumentSubmitValues) => void;
}

/** Edit document metadata (title, category, expiry). Not for upload. */
export function DocumentDialog({
  open,
  onClose,
  initial,
  title,
  submitLabel,
  isSubmitting = false,
  serverError = null,
  onSubmit,
}: DocumentDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', category: 'other', expires_at: '' },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: initial?.title ?? '',
        category: initial?.category ?? 'other',
        expires_at: initial?.expires_at ?? '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = (values: DocumentFormValues) => {
    onSubmit({
      title: values.title,
      category: values.category,
      expires_at: values.expires_at || null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="Detalhes do documento"
      size="md"
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
          placeholder="Ex.: Contrato de compra, Recibo de sinal"
          error={errors.title?.message}
          autoFocus
          {...register('title')}
        />
        <Select label="Categoria" error={errors.category?.message} {...register('category')}>
          {DOC_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </Select>
        <Input label="Vencimento (opcional)" type="date" error={errors.expires_at?.message} {...register('expires_at')} />
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
