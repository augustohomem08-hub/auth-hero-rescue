import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { Modal, Button, Input, Textarea, Select } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { uploadFile, deleteFile, getSignedUrl } from '@/lib/storage';
import {
  ITEM_PRIORITIES,
  ITEM_STATUSES,
  ITEM_UNITS,
} from './itemConstants';
import type { ItemPriority, ItemStatus, Room } from '@/types/purchases';

const schema = z.object({
  name: z.string().min(1, 'Dê um nome ao item.').max(80, 'Máximo de 80 caracteres.'),
  room_id: z.string().min(1, 'Escolha um ambiente.'),
  description: z.string().max(280, 'Máximo de 280 caracteres.').optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
  quantity: z.number().min(0, 'Quantidade inválida.'),
  unit: z.string().optional().or(z.literal('')),
  estimated_price: z.number().min(0).optional(),
  paid_price: z.number().min(0).optional(),
  store: z.string().max(80).optional().or(z.literal('')),
  link: z.string().url('Link inválido.').optional().or(z.literal('')),
  status: z.enum(['planned', 'researching', 'budgeted', 'purchased', 'delivered', 'installed']),
  priority: z.enum(['low', 'medium', 'high']),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export type ItemFormValues = z.infer<typeof schema>;

/** Values handed to the parent on submit (nulls normalized, image attached). */
export interface ItemSubmitValues {
  room_id: string;
  name: string;
  description: string | null;
  category: string | null;
  quantity: number;
  unit: string | null;
  estimated_price: number | null;
  paid_price: number | null;
  store: string | null;
  link: string | null;
  status: ItemStatus;
  priority: ItemPriority;
  notes: string | null;
  image: string | null;
}

interface ItemDialogProps {
  open: boolean;
  onClose: () => void;
  rooms: Room[];
  /** Pass existing values for edit mode. */
  initial?: Partial<ItemSubmitValues> | null;
  title: string;
  submitLabel: string;
  isSubmitting?: boolean;
  serverError?: string | null;
  onSubmit: (values: ItemSubmitValues) => void;
}

/**
 * Create/edit form for a purchase item. Covers every field in the extended
 * items schema. Image uploads go to the private `images` storage bucket and
 * the returned path is stored on the row (signed URL resolved client-side).
 */
export function ItemDialog({
  open,
  onClose,
  rooms,
  initial,
  title,
  submitLabel,
  isSubmitting = false,
  serverError = null,
  onSubmit,
}: ItemDialogProps) {
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [invalid, setInvalid] = useState(false);
  const [imagePath, setImagePath] = useState<string | null>(initial?.image ?? null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      room_id: initial?.room_id ?? rooms[0]?.id ?? '',
      description: '',
      category: '',
      quantity: 1,
      unit: 'un',
      estimated_price: 0,
      paid_price: 0,
      store: '',
      link: '',
      status: 'planned',
      priority: 'medium',
      notes: '',
    },
  });

  // Sync defaults when the dialog opens or the target item changes.
  useEffect(() => {
    if (open) {
      setInvalid(false);
      reset({
        name: initial?.name ?? '',
        room_id: initial?.room_id ?? rooms[0]?.id ?? '',
        description: initial?.description ?? '',
        category: initial?.category ?? '',
        quantity: initial?.quantity ?? 1,
        unit: initial?.unit ?? 'un',
        estimated_price: initial?.estimated_price ?? 0,
        paid_price: initial?.paid_price ?? 0,
        store: initial?.store ?? '',
        link: initial?.link ?? '',
        status: initial?.status ?? 'planned',
        priority: initial?.priority ?? 'medium',
        notes: initial?.notes ?? '',
      });
      const img = initial?.image ?? null;
      setImagePath(img);
      if (img) {
        getSignedUrl('images', img).then(setImageUrl).catch(() => setImageUrl(null));
      } else {
        setImageUrl(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setImageError(null);
    setImageUploading(true);
    try {
      // Remove previous image if replacing.
      if (imagePath) {
        await deleteFile('images', imagePath).catch(() => undefined);
      }
      const { path } = await uploadFile('images', file, { userId: user.id });
      setImagePath(path);
      const signed = await getSignedUrl('images', path);
      setImageUrl(signed);
    } catch {
      setImageError('Não foi possível enviar a imagem.');
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = async () => {
    if (imagePath) {
      await deleteFile('images', imagePath).catch(() => undefined);
    }
    setImagePath(null);
    setImageUrl(null);
  };

  const submit = (values: ItemFormValues) => {
    setInvalid(false);
    onSubmit({
      room_id: values.room_id,
      name: values.name,
      description: values.description || null,
      category: values.category || null,
      quantity: values.quantity,
      unit: values.unit || null,
      estimated_price: values.estimated_price || null,
      paid_price: values.paid_price || null,
      store: values.store || null,
      link: values.link || null,
      status: values.status,
      priority: values.priority,
      notes: values.notes || null,
      image: imagePath,
    });
  };

  // Surfaces a visible banner when the form is blocked by validation —
  // otherwise the submit button appears to do nothing on small screens where
  // the offending field is scrolled out of view.
  const onInvalid = () => {
    setInvalid(true);
    formRef.current
      ?.querySelector<HTMLElement>('[data-error="true"], [aria-invalid="true"]')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const noRooms = rooms.length === 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="Detalhe do item para acompanhar a compra"
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            size="md"
            isLoading={isSubmitting}
            disabled={noRooms}
            onClick={handleSubmit(submit, onInvalid)}
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <form ref={formRef} onSubmit={handleSubmit(submit, onInvalid)} className="space-y-4">
        {noRooms && (
          <p className="rounded-lg border border-warning-300 bg-warning-100 px-3 py-2 text-sm font-medium text-warning-900 dark:border-warning-700 dark:bg-warning-900/40 dark:text-warning-100">
            Você ainda não tem ambientes. Crie um ambiente (ex.: Cozinha) antes de
            adicionar itens.
          </p>
        )}

        {invalid && Object.keys(errors).length > 0 && (
          <p
            role="alert"
            className="rounded-lg border border-danger-300 bg-danger-100 px-3 py-2 text-sm font-medium text-danger-900 dark:border-danger-700 dark:bg-danger-900/40 dark:text-danger-100"
          >
            Revise os campos destacados para continuar.
          </p>
        )}

        {/* Image uploader */}
        <div>
          {imageUrl ? (
            <div className="relative group h-36 w-full overflow-hidden rounded-xl border border-surface-200 dark:border-surface-700">
              <img src={imageUrl} alt="Pré-visualização" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute right-2 top-2 rounded-lg bg-surface-950/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remover imagem"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-surface-300 text-surface-400 transition-colors hover:border-primary-400 hover:text-primary-500 dark:border-surface-700">
              {imageUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ImagePlus className="h-5 w-5" />
              )}
              <span className="text-xs">
                {imageUploading ? 'Enviando…' : 'Adicionar imagem do item'}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageChange}
                disabled={imageUploading}
              />
            </label>
          )}
          {imageError && <p className="mt-1 text-xs text-danger-600">{imageError}</p>}
        </div>

        <Input
          label="Nome do item"
          placeholder="Ex.: Sofá 3 lugares"
          error={errors.name?.message}
          autoFocus
          {...register('name')}
        />

        <Textarea
          label="Descrição (opcional)"
          placeholder="Cor, material, medidas…"
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-1 gap-4">
          <Select label="Ambiente" error={errors.room_id?.message} {...register('room_id')}>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantidade"
            type="number"
            min={0}
            step="0.01"
            error={errors.quantity?.message}
            {...register('quantity', { setValueAs: (v) => (v === '' || v == null ? 0 : Number(v)) })}
          />
          <Select label="Unidade" {...register('unit')}>
            {ITEM_UNITS.map((u) => (
              <option key={u.key} value={u.key}>
                {u.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Preço previsto (R$)"
            type="number"
            min={0}
            step="0.01"
            placeholder="0,00"
            error={errors.estimated_price?.message}
            {...register('estimated_price', { setValueAs: (v) => (v === '' || v == null ? 0 : Number(v)) })}
          />
          <Input
            label="Preço pago (R$)"
            type="number"
            min={0}
            step="0.01"
            placeholder="0,00"
            error={errors.paid_price?.message}
            {...register('paid_price', { setValueAs: (v) => (v === '' || v == null ? 0 : Number(v)) })}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Loja (opcional)"
            placeholder="Ex.: Magazine Luza"
            error={errors.store?.message}
            {...register('store')}
          />
          <Input
            label="Link (opcional)"
            placeholder="https://"
            error={errors.link?.message}
            {...register('link')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Status" {...register('status')}>
            {ITEM_STATUSES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </Select>
          <Select label="Prioridade" {...register('priority')}>
            {ITEM_PRIORITIES.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>

        <Textarea
          label="Observações (opcional)"
          placeholder="Notas internas sobre a compra"
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
