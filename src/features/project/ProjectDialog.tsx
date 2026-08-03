import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, Button, Input } from '@/components/ui';
import type { Project } from '@/types/project';

const schema = z.object({
  name: z.string().min(1, 'Dê um nome ao projeto.').max(60, 'Máximo de 60 caracteres.'),
  apartmentName: z.string().max(80, 'Máximo de 80 caracteres.').optional(),
  builderName: z.string().max(80, 'Máximo de 80 caracteres.').optional(),
  expectedDeliveryDate: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof schema>;

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  isSubmitting?: boolean;
  serverError?: string | null;
  onSubmit: (values: ProjectFormValues) => void;
}

/**
 * Edit form for the project identity fields (name, apartment, builder and
 * expected delivery date). Follows the same prefilled edit-mode pattern used
 * by RoomDialog. The delivery date written here is the very same
 * `expected_delivery_date` the Home/Cronograma countdown reads.
 */
export function ProjectDialog({
  open,
  onClose,
  project,
  isSubmitting = false,
  serverError = null,
  onSubmit,
}: ProjectDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', apartmentName: '', builderName: '', expectedDeliveryDate: '' },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: project.name ?? '',
        apartmentName: project.apartment_name ?? '',
        builderName: project.builder_name ?? '',
        expectedDeliveryDate: project.expected_delivery_date ?? '',
      });
    }
  }, [open, project, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar projeto"
      description="Nome, imóvel e data de entrega prevista"
      size="md"
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" size="md" isLoading={isSubmitting} onClick={handleSubmit(onSubmit)}>
            Salvar alterações
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome do projeto"
          placeholder="Ex.: Nosso primeiro lar"
          error={errors.name?.message}
          autoFocus
          {...register('name')}
        />
        <Input
          label="Apartamento / imóvel"
          placeholder="Ex.: Apto 302 — Residencial Aurora"
          error={errors.apartmentName?.message}
          {...register('apartmentName')}
        />
        <Input
          label="Construtora"
          placeholder="Ex.: Construtora Alfa"
          error={errors.builderName?.message}
          {...register('builderName')}
        />
        <Input
          label="Entrega prevista"
          type="date"
          error={errors.expectedDeliveryDate?.message}
          {...register('expectedDeliveryDate')}
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
