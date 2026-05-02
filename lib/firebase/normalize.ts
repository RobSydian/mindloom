function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasToDate(value: unknown): value is { toDate: () => Date } {
  return isObject(value) && typeof value.toDate === 'function';
}

function hasSecondsNanoseconds(value: unknown): value is { seconds: number; nanoseconds?: number } {
  return (
    isObject(value) &&
    typeof value.seconds === 'number' &&
    (value.nanoseconds === undefined || typeof value.nanoseconds === 'number')
  );
}

export function normalizeDateLike(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return new Date(value).toISOString();
  if (value instanceof Date) return value.toISOString();
  if (hasToDate(value)) return value.toDate().toISOString();
  if (hasSecondsNanoseconds(value)) {
    const ms = value.seconds * 1000 + Math.floor((value.nanoseconds ?? 0) / 1_000_000);
    return new Date(ms).toISOString();
  }
  return new Date(0).toISOString();
}
