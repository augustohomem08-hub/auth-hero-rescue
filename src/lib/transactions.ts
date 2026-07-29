import { supabase } from '@/lib/supabase';
import type { Transaction, TransactionType } from '@/types/finance';

/**
 * Data-access layer for the Financeiro module's `transactions` table.
 * Mirrors the `create_finance_transactions` migration. All calls run through
 * the authenticated Supabase client; RLS enforces membership via the owning
 * project.
 */

const SELECT =
  'id, project_id, title, description, category, type, amount, date, notes, ' +
  'source_item_id, created_at, updated_at';

/** Row shape accepted by insert/update (snake_case, optional fields). */
export interface TransactionInput {
  project_id: string;
  title: string;
  description?: string | null;
  category?: string;
  type?: TransactionType;
  amount?: number;
  date?: string;
  notes?: string | null;
  source_item_id?: string | null;
}

/** List all transactions for a project, ordered by newest date then created. */
export async function listTransactionsForProject(
  projectId: string
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select(SELECT)
    .eq('project_id', projectId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as unknown as Transaction[]) ?? [];
}

/** Create a transaction. */
export async function createTransaction(
  input: TransactionInput
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      project_id: input.project_id,
      title: input.title,
      description: input.description ?? null,
      category: input.category ?? 'outros',
      type: input.type ?? 'expense',
      amount: input.amount ?? 0,
      date: input.date ?? new Date().toISOString().slice(0, 10),
      notes: input.notes ?? null,
      source_item_id: input.source_item_id ?? null,
    })
    .select(SELECT)
    .single();
  if (error) throw error;
  return data as unknown as Transaction;
}

/** Update editable fields on a transaction. */
export async function updateTransaction(
  transactionId: string,
  patch: Partial<TransactionInput>
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update(patch)
    .eq('id', transactionId)
    .select(SELECT)
    .single();
  if (error) throw error;
  return data as unknown as Transaction;
}

/** Delete a single transaction. */
export async function deleteTransaction(transactionId: string): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId);
  if (error) throw error;
}

/** Delete many transactions at once. */
export async function deleteTransactions(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await supabase
    .from('transactions')
    .delete()
    .in('id', ids);
  if (error) throw error;
}

/**
 * Upsert a Compras-mirrored transaction for a given item. If the item already
 * has a mirror (matched by source_item_id), update its title/amount/date;
 * otherwise insert a new one. Passing amount = null deletes the existing
 * mirror (the item's paid_price was cleared). Uses upsert with onConflict
 * on the unique source_item_id constraint to avoid TOCTOU race conditions.
 */
export async function upsertMirrorTransaction(args: {
  projectId: string;
  itemId: string;
  itemName: string;
  amount: number | null;
}): Promise<void> {
  const { projectId, itemId, itemName, amount } = args;

  if (amount == null || amount <= 0) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('source_item_id', itemId)
      .eq('project_id', projectId);
    if (error) throw error;
    return;
  }

  const { error: upsertErr } = await supabase
    .from('transactions')
    .upsert(
      {
        project_id: projectId,
        title: itemName,
        category: 'outros',
        type: 'expense' as TransactionType,
        amount,
        date: new Date().toISOString().slice(0, 10),
        source_item_id: itemId,
      },
      { onConflict: 'source_item_id' }
    );
  if (upsertErr) throw upsertErr;
}
