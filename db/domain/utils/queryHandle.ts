import type { SQL } from "drizzle-orm";
import { and, eq, like, or } from "drizzle-orm";

export type Filter<T> = {
    field: keyof T;
    value: any;
};

export function buildFilterConditions<T extends Record<string, any>>(
    table: T,
    filters: Filter<T>[]
): SQL | undefined {
    if (!filters.length) return undefined;

    const conditions = filters.map((f) =>
        eq(table[f.field] as any, f.value)
    );

    return and(...conditions);
}

export function buildSearchConditions<T extends Record<string, any>>(
    table: T,
    value: string,
    fields: (keyof T)[]
): SQL | undefined {
    const trimmed = value.trim();
    if (!trimmed || fields.length === 0) return undefined;

    const pattern = `%${trimmed}%`;

    const conditions = fields.map((field) =>
        like(table[field] as any, pattern)
    );

    return or(...conditions);
}

export function paginationValues(page = 1, limit = 10, total = 0): number {
    const totalPages = Math.ceil(total / limit);
    return totalPages;
}