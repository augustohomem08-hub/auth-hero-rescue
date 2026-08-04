import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { Modal, Button, Input } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { deleteFile, getSignedUrl, uploadFile } from '@/lib/storage';
import type { Project } from '@/types/project';

const schema = z.object({
  name: z.string().min(1, 'Dê um nome ao projeto.').max(60, 'Máximo de 60 caracteres.'),
  apartmentName: z.string().max(80, 'Máximo de 80 caracteres.').optional(),
  builderName: z.string().max(80, 'Máximo de 80 caracteres.').optional(),
  expectedDeliveryDate: z.string().optional(),
});

type FormFields = z.infer<typeof schema>;

/** Values handed to the parent on submit (cover path attached). */
export type ProjectFormValues = FormFields & {
  /** Path in the private `images` bucket, or null for the default gradient. */
  coverImage: string | null;
};

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  isSubmitting?: boolean;
  serverError?: string | null;
  onSubmit: (values: ProjectFormValues) => void;
}

/**
 * Edit form for the project identity fields (name, apartment, builder,
 * expected delivery date and optional cover photo). The cover photo follows
 * the same upload pattern as item/memory photos: it goes to the private
 * `images` bucket and only the path is stored on `projects.cover_image`.
 */
export function ProjectDialog({
  open,
  onClose,
  project,
  isSubmitting = false,
  serverError = null,
  onSubmit,
}: ProjectDialogProps) {
  const { user } = useAuth();
  const [coverPath, setCoverPath] = useState<string | null>(project.cover_image ?? null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', apartmentName: '', builderName: '', expectedDeliveryDate: '' },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      name: project.name ?? '',
      apartmentName: project.apartment_name ?? '',
      builderName: project.builder_name ?? '',
      expectedDeliveryDate: project.expected_delivery_date ?? '',
    });
    const path = project.cover_image ?? null;
    setCoverPath(path);
    setCoverError(null);
    setCoverUrl(null);
    if (path) {
      getSignedUrl('images', path)
        .then(setCoverUrl)
        .catch(() => setCoverUrl(null));
    }
  }, [open, project, reset]);

  async function handleCoverChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !user) return;
    setCoverUploading(true);
    setCoverError(null);
    try {
      const previous = coverPath;
      const { path } = await uploadFile('images', file, { userId: user.id });
      const signed = await getSignedUrl('images', path);
      setCoverPath(path);
      setCoverUrl(signed);
      if (previous && previous !== project.cover_image) {
        await deleteFile('images', previous).catch(() => undefined);
      }
    } catch {
      setCoverError('Não foi possível enviar a imagem.');
    } finally {
      setCoverUploading(false);
    }
  }

  function removeCover() {
    setCoverPath(null);
    setCoverUrl(null);
  }

  const submit = handleSubmit((values) => onSubmit({ ...values, coverImage: coverPath }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar projeto"
      description="Nome, imóvel, foto de capa e data de entrega prevista"
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
            disabled={coverUploading}
            onClick={submit}
          >
            Salvar alterações
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {/* Optional cover photo — gradient stays the default when empty. */}
        <div>
          {coverUrl ? (
            <div className="relative group h-36 w-full overflow-hidden rounded-xl border border-surface-200 dark:border-surface-700">
              <img src={coverUrl} alt="Pré-visualização da capa" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={removeCover}
                className="absolute right-2 top-2 rounded-lg bg-surface-950/50 p-1.5 text-white opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100"
                aria-label="Remover foto de capa"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-surface-300 text-surface-400 transition-colors hover:border-primary-400 hover:text-primary-500 dark:border-surface-700">
              {coverUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ImagePlus className="h-5 w-5" />
              )}
              <span className="text-xs">
                {coverUploading ? 'Enviando…' : 'Adicionar foto de capa (opcional)'}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleCoverChange}
                disabled={coverUploading}
              />
            </label>
          )}
          {coverError && <p className="mt-1 text-xs text-danger-600">{coverError}</p>}
        </div>

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
