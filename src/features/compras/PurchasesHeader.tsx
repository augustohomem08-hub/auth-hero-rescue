import type { ReactNode } from 'react';
import { Breadcrumb, type BreadcrumbItem } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';

interface PurchasesHeaderProps {
  emoji: string;
  title: string;
  description: string;
  breadcrumb: BreadcrumbItem[];
  /** Right-aligned slot for future primary actions (e.g. "Adicionar item"). */
  action?: ReactNode;
}

/** Module header: breadcrumb trail + page title/description + action slot. */
export function PurchasesHeader({
  emoji,
  title,
  description,
  breadcrumb,
  action,
}: PurchasesHeaderProps) {
  return (
    <div className="space-y-3">
      <Breadcrumb items={breadcrumb} />
      <PageHeader emoji={emoji} title={title} description={description} action={action} />
    </div>
  );
}
