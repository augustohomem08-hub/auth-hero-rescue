import { useCallback, useEffect, useState } from 'react';

/**
 * In-app notification preferences.
 *
 * There is no delivery channel (push/e-mail) yet, so preferences are stored
 * per device in localStorage and only control what the app renders — today
 * that is the "Datas importantes" deadline card on the Home screen.
 */
export interface NotificationPrefs {
  /** Show the in-app deadline alert card (overdue / due-soon milestones). */
  deadlineAlerts: boolean;
  /** Include milestones that are only "due soon" (not yet overdue). */
  includeDueSoon: boolean;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  deadlineAlerts: true,
  includeDueSoon: true,
};

const STORAGE_KEY = 'npl-notifications';
const EVENT = 'npl-notifications-change';

export function readNotificationPrefs(): NotificationPrefs {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFS;
    return { ...DEFAULT_NOTIFICATION_PREFS, ...(JSON.parse(raw) as Partial<NotificationPrefs>) };
  } catch {
    return DEFAULT_NOTIFICATION_PREFS;
  }
}

/** Read + update notification preferences, synced across mounted components. */
export function useNotificationPrefs() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);

  // Read after mount so SSR and the first client render agree.
  useEffect(() => {
    setPrefs(readNotificationPrefs());
    const onChange = () => setPrefs(readNotificationPrefs());
    window.addEventListener(EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const update = useCallback((patch: Partial<NotificationPrefs>) => {
    const next = { ...readNotificationPrefs(), ...patch };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setPrefs(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { prefs, update };
}
