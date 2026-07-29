import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Button, Input, Textarea, Select } from '@/components/ui';
import { MILESTONE_STATUSES } from './milestoneConstants';
import type { MilestoneStatus } from '@/types/cronograma';

const schema = z.object({
  title: z.string().min(1, 'Dê um título ao marco.').max(80, 'Máximo de 80 caracteres.'),
  description: z.string().max(280).optional().or(z.literal('')),
  date: z.string().optional().or(z.literal('')),
  status: z.enum(['planned', 'in_progress', 'done', 'delayed', 'cancelled']),
});

export type MilestoneFormValues = z.infer<typeof schema>;

export interface MilestoneSubmitValues {
  title: string;
  description: string | null;
  date: string | null;
  status: MilestoneStatus;
}

interface MilestoneDialogProps {
  open: boolean;
  onClose: () => void;
  initial?: Partial<MilestoneSubmitValues> | null;
  title: string;
  submitLabel: string;
  isSubmitting?: boolean;
  serverError?: string | null;
  onSubmit: (values: MilestoneSubmitValues) => void;
}

export function MilestoneDialog({
  open,
  onClose,
  initial,
  title,
  submitLabel,
  isSubmitting = false,
  serverError = null,
  onSubmit,
}: MilestoneDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MilestoneFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      status: 'planned',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: initial?.title ?? '',
        description: initial?.description ?? '',
        date: initial?.date ?? '',
        status: initial?.status ?? 'planned',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = (values: MilestoneFormValues) => {
    onSubmit({
      title: values.title,
      description: values.description || null,
      date: values.date || null,
      status: values.status,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="Etapa ou marco do cronograma"
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
          placeholder="Ex.: Assinatura do contrato, Entrega das chaves"
          error={errors.title?.message}
          autoFocus
          {...register('title')}
        />
        <Textarea
          label="Descrição (opcional)"
          placeholder="Detalhes da etapa"
          error={errors.description?.message}
          {...register('description')}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Data (opcional)" type="date" error={errors.date?.message} {...register('date')} />
          <Select label="Status" error={errors.status?.message} {...register('status')}>
            {MILESTONE_STATUSES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
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
