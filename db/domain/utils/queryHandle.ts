import type { SQL } from "drizzle-orm";
import { and, asc, desc, eq, gt, gte, like, lt, lte, or } from "drizzle-orm";

export type Filter<T> = {
    field: keyof T;
    value: any;
};

export type CompareFilter<T> = {
    field: keyof T;
    value: any;
    compare: "gt" | "lt" | "gte" | "lte";
};

export type SortValue<T> = {
    field: keyof T;
    order: "asc" | "desc";
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

export function buildCompareFilterConditions<T extends Record<string, any>>(
    table: T,
    filters: CompareFilter<T>[]
): SQL | undefined {
    if (!filters.length) return undefined;

    const conditions = filters.map((f) => {
        if (f.compare === "gt") {
            return gt(table[f.field] as any, f.value);
        } else if (f.compare === "lt") {
            return lt(table[f.field] as any, f.value);
        }
        else if (f.compare === "gte") {
            return gte(table[f.field] as any, f.value);
        }
        else {
            return lte(table[f.field] as any, f.value);
        }
    });

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

export function buildSortConditions<T extends Record<string, any>>(
    table: T,
    sort: SortValue<T>
): SQL | undefined {

    if (!sort.field) return undefined;

    const conditions =
        sort.order === "asc" ? asc(table[sort.field] as any) : desc(table[sort.field] as any)


    return and(conditions);
}

export function paginationValues(page = 1, limit = 10, total = 0): number {
    const totalPages = Math.ceil(total / limit);
    return totalPages;
}