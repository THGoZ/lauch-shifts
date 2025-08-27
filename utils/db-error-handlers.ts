import { FieldError } from "@/interfaces/interface";

export function parseSQLiteErrorFields(error: unknown): FieldError[] {
  if (!error || typeof error !== 'object') return [];

  const message =
    (error as any).message || (error as any).toString?.() || '';

  const fieldErrors: FieldError[] = [];

  // Common SQLite error patterns
  const patterns: RegExp[] = [
    /column\s+['"`]?(\w+)['"`]?\s+is\s+not\s+present/i,
    /no\s+column\s+named\s+['"`]?(\w+)['"`]?/i,
    /NOT\s+NULL\s+constraint\s+failed:\s*(\w+)\.(\w+)/i,
    /UNIQUE\s+constraint\s+failed:\s*(\w+)\.(\w+)/i,
    /has\s+no\s+column\s+named\s+['"`]?(\w+)['"`]?/i,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(message);
    if (match) {
      const field = match[2] ?? match[1];
      if (field) {
        fieldErrors.push({ field, message });
      }
    }
  }

  return fieldErrors;
}

export default {
  parseSQLiteErrorFields,
}