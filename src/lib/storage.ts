import { supabase } from '@/lib/supabase';

export type StorageBucket = 'images' | 'documents';

export interface UploadResult {
  path: string;
  /** Signed URL valid for `expiresIn` seconds. Use this in <img>/download. */
  signedUrl: string;
}

const DEFAULT_EXPIRY = 60 * 60; // 1 hour

/** Sanitize a file name for safe use in a storage path. Strips path separators and parent-dir sequences. */
export function sanitizeFileName(name: string): string {
  return name.replace(/\/+/g, '').replace(/\.\./g, '').replace(/^\.+/, '') || 'file';
}

/**
 * Upload a file to a private bucket under a per-user prefix and return a
 * signed URL. Path layout: `<userId>/<timestamp>-<sanitized-filename>` keeps
 * each user's files isolated and avoids name collisions.
 *
 * Requires an authenticated session (owner is set to auth.uid() by RLS).
 */
export async function uploadFile(
  bucket: StorageBucket,
  file: File,
  options: { userId: string; expiresInSeconds?: number } | { path?: string; expiresInSeconds?: number }
): Promise<UploadResult> {
  const expiresIn = options.expiresInSeconds ?? DEFAULT_EXPIRY;
  const path =
    'path' in options && options.path
      ? options.path
      : `${(options as { userId: string }).userId}/${Date.now()}-${sanitizeFileName(file.name)}`;

  const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (upErr) throw upErr;

  const signedUrl = await getSignedUrl(bucket, path, expiresIn);
  return { path, signedUrl };
}

/** Generate a time-limited signed URL for reading a private object. */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresInSeconds = DEFAULT_EXPIRY
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  if (!data?.signedUrl) throw new Error('Failed to generate signed URL.');
  return data.signedUrl;
}

/** Delete an object from a bucket. Caller must own it (RLS enforces). */
export async function deleteFile(bucket: StorageBucket, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

/** List objects under a prefix (e.g. a user's folder) in a bucket. */
export async function listFiles(
  bucket: StorageBucket,
  prefix: string,
  options: { limit?: number; offset?: number } = {}
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(prefix, { limit: options.limit ?? 100, offset: options.offset ?? 0 });
  if (error) throw error;
  return data;
}
