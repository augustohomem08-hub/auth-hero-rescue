/**
 * Financeiro module domain types — mirrors the `transactions` table created
 * in the `create_finance_transactions` migration.
 *
 * A transaction belongs directly to a project (not through a room). Entries
 * mirrored from Compras carry a `source_item_id` referencing the item whose
 * `paid_price` generated them, so the two modules stay in sync without
 * duplicating records.
 */

/** Either a receita (income) or a despesa (expense). Mirrors `transaction_type`. */
export type TransactionType = 'income' | 'expense';

/** Row in the `transactions` table. */
export interface Transaction {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  /** Category key (e.g. 'moveis', 'reforma'). Defaults to 'outros'. */
  category: string;
  type: TransactionType;
  /** Value in BRL. Stored numeric; client treats as number. Non-negative. */
  amount: number;
  /** ISO date string (yyyy-mm-dd). */
  date: string;
  notes: string | null;
  /** When set, this transaction mirrors a Compras item's paid_price. */
  source_item_id: string | null;
  created_at: string;
  updated_at: string;
}
