import {
  FileText,
  Receipt,
  ScrollText,
  User,
  File,
  BookText,
  Map,
  Barcode,
  BadgeCheck,
  ShieldCheck,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';
import type { BadgeTone } from '@/components/ui';
import type { DocumentCategory } from '@/types/documentos';

export interface DocCategoryPreset {
  key: DocumentCategory;
  label: string;
  Icon: LucideIcon;
  tone: BadgeTone;
}

export const DOC_CATEGORIES: DocCategoryPreset[] = [
  { key: 'contract', label: 'Contrato', Icon: FileText, tone: 'primary' },
  { key: 'memorial', label: 'Memorial descritivo', Icon: BookText, tone: 'primary' },
  { key: 'blueprint', label: 'Planta', Icon: Map, tone: 'secondary' },
  { key: 'bill', label: 'Boleto', Icon: Barcode, tone: 'warning' },
  { key: 'receipt', label: 'Recibo', Icon: Receipt, tone: 'accent' },
  { key: 'proof', label: 'Comprovante', Icon: BadgeCheck, tone: 'success' },
  { key: 'warranty', label: 'Garantia', Icon: ShieldCheck, tone: 'success' },
  { key: 'manual', label: 'Manual', Icon: BookOpen, tone: 'neutral' },
  { key: 'certificate', label: 'Certificado', Icon: ScrollText, tone: 'secondary' },
  { key: 'personal', label: 'Pessoal', Icon: User, tone: 'neutral' },
  { key: 'other', label: 'Outros', Icon: File, tone: 'neutral' },
];

const CATEGORY_MAP = new Map(DOC_CATEGORIES.map((c) => [c.key, c]));

export function categoryLabel(key: DocumentCategory): string {
  return CATEGORY_MAP.get(key)?.label ?? 'Outros';
}
export function categoryIcon(key: DocumentCategory): LucideIcon {
  return CATEGORY_MAP.get(key)?.Icon ?? File;
}
export function categoryTone(key: DocumentCategory): BadgeTone {
  return CATEGORY_MAP.get(key)?.tone ?? 'neutral';
}
