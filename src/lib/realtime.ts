import { useEffect, useId } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Subscribe to Postgres Changes on a table and invalidate matching TanStack
 * Query cache entries when any change lands. This is the glue between
 * Supabase Realtime and React Query: the table stays in sync across the two
 * partners without manual refetches.
 *
 * Realtime requires the table to be added to the Supabase realtime publication
 * (`alter publication supabase_realtime add table <name>`). That will be done
 * in the migration that creates each data table — no tables exist yet.
 *
 * @param table      Table name to watch.
 * @param queryKey   TanStack Query key prefix to invalidate on any event.
 *                   Pass an array, e.g. ['compras']. All queries whose key
 *                   starts with this prefix are invalidated.
 * @param enabled    Skip subscription when false (e.g. until a project is loaded).
 */
export function useRealtimeSync(
  table: string,
  queryKey: unknown[],
  enabled = true
): void {
  const queryClient = useQueryClient();
  const keyRef = JSON.stringify(queryKey);

  useEffect(() => {
    if (!enabled) return;
    const parsedKey = JSON.parse(keyRef) as unknown[];

    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          queryClient.invalidateQueries({ queryKey: parsedKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, keyRef, enabled, queryClient]);
}


