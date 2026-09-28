/**
 * Maps between app records (camelCase) and Postgres rows (snake_case).
 * Only top-level keys are renamed: jsonb columns (event, reactions,
 * notifications) keep the app's own keys.
 */

type Row = Record<string, unknown>;

/** Timestamp columns. Postgres returns "+00:00" offsets; the app uses UTC ISO ("Z"). */
const TIMESTAMPS = new Set(["createdAt", "updatedAt", "joinedAt"]);

const toSnake = (key: string) => key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const toCamel = (key: string) => key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

export function toRow(record: object): Row {
  const row: Row = {};
  for (const [key, value] of Object.entries(record)) {
    if (value !== undefined) row[toSnake(key)] = value;
  }
  return row;
}

export function fromRow<T>(row: Row): T {
  const record: Row = {};
  for (const [key, value] of Object.entries(row)) {
    const name = toCamel(key);
    record[name] = TIMESTAMPS.has(name) && typeof value === "string" ? new Date(value).toISOString() : value;
  }
  return record as T;
}
