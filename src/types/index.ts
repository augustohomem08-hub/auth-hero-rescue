/** Shared domain types. Module-specific types will live under src/features/<module>/types.ts */

export type Theme = 'light' | 'dark';

export interface AuthSession {
  userId: string;
  email: string;
  partnerId?: string | null;
}

/** Common pagination shape for list endpoints. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Re-export shared-project domain types so modules can import from one place.
export type {
  Project,
  ProjectMember,
  ProjectRole,
  InvitationStatus,
  ProjectScoped,
  ActiveProject,
} from './project';

// Re-export Purchases module domain types.
export type {
  Room,
  Item,
  ItemStatus,
  ItemPriority,
  RoomWithItems,
} from './purchases';
export { ITEM_STATUS_FLOW } from './purchases';

// Re-export Financeiro module domain types.
export type { Transaction, TransactionType } from './finance';

// Re-export Cronograma module domain types.
export type { Milestone, MilestoneStatus } from './cronograma';

// Re-export Documentos module domain types.
export type { DocumentRecord, DocumentCategory } from './documentos';

// Re-export Jornada module domain types.
export type { Memory } from './jornada';
