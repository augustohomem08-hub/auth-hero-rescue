import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Button, Input, Textarea, Select } from '@/components/ui';
import {
  FINANCE_CATEGORIES,
  TRANSACTION_TYPES,
} from './transactionConstants';
import type { TransactionType } from '@/types/finance';

const schema = z.object({
  title: z.string().min(1, 'Dê um título ao lançamento.').max(80, 'Máximo de 80 caracteres.'),
  description: z.string().max(280, 'Máximo de 280 caracteres.').optional().or(z.literal('')),
  category: z.string().min(1, 'Escolha uma categoria.'),
  type: z.enum(['income', 'expense']),
  amount: z.number().min(0, 'Valor inválido.'),
  date: z.string().min(1, 'Informe a data.'),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export type TransactionFormValues = z.infer<typeof schema>;

/** Values handed to the parent on submit (nulls normalized). */
export interface TransactionSubmitValues {
  title: string;
  description: string | null;
  category: string;
  type: TransactionType;
  amount: number;
  date: string;
  notes: string | null;
}

interface TransactionDialogProps {
  open: boolean;
  onClose: () => void;
  initial?: Partial<TransactionSubmitValues> | null;
  title: string;
  submitLabel: string;
  isSubmitting?: boolean;
  serverError?: string | null;
  onSubmit: (values: TransactionSubmitValues) => void;
}

/**
 * Create/edit form for a financial transaction. Covers every field in the
 * transactions schema except the Compras mirror link (source_item_id), which
 * is managed automatically by the sync hook, not by this manual form.
 */
export function TransactionDialog({
  open,
  onClose,
  initial,
  title,
  submitLabel,
  isSubmitting = false,
  serverError = null,
  onSubmit,
}: TransactionDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      category: 'outros',
      type: 'expense',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  });

  // Sync defaults when the dialog opens or the target transaction changes.
  useEffect(() => {
    if (open) {
      reset({
        title: initial?.title ?? '',
        description: initial?.description ?? '',
        category: initial?.category ?? 'outros',
        type: initial?.type ?? 'expense',
        amount: initial?.amount ?? 0,
        date: initial?.date ?? new Date().toISOString().slice(0, 10),
        notes: initial?.notes ?? '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = (values: TransactionFormValues) => {
    onSubmit({
      title: values.title,
      description: values.description || null,
      category: values.category,
      type: values.type,
      amount: values.amount,
      date: values.date,
      notes: values.notes || null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="Receita ou despesa do projeto"
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
          placeholder="Ex.: Geladeira, Salário, Entrada do imóvel"
          error={errors.title?.message}
          autoFocus
          {...register('title')}
        />

        <Textarea
          label="Descrição (opcional)"
          placeholder="Detalhes do lançamento"
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Tipo" error={errors.type?.message} {...register('type')}>
            {TRANSACTION_TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </Select>
          <Select label="Categoria" error={errors.category?.message} {...register('category')}>
            {FINANCE_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Valor (R$)"
            type="number"
            min={0}
            step="0.01"
            placeholder="0,00"
            error={errors.amount?.message}
            {...register('amount', { setValueAs: (v) => (v === '' || v == null ? 0 : Number(v)) })}
          />
          <Input
            label="Data"
            type="date"
            error={errors.date?.message}
            {...register('date')}
          />
        </div>

        <Textarea
          label="Observação (opcional)"
          placeholder="Notas internas sobre o lançamento"
          error={errors.notes?.message}
          {...register('notes')}
        />

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
