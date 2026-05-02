const seen = new Set<string>();

export function logQueryError(scope: string, error: unknown, context?: string): void {
  const err = error as { code?: string; message?: string };
  const code = err?.code ?? 'unknown';
  const message = err?.message ?? String(error);
  const key = `${scope}|${context ?? 'global'}|${code}|${message}`;
  if (seen.has(key)) return;
  seen.add(key);
  console.warn(`[query:${scope}] failed`, { code, message, context });
}
