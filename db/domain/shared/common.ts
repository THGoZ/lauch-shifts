import { db } from "@/db/db";
import { count, SQL } from "drizzle-orm";
import { SQLiteTable } from "drizzle-orm/sqlite-core";


export const countDbQuery = async (table: SQLiteTable , whereClause?: SQL): Promise<number> => {
    const response = await db
    .select({count: count()})
    .from(table)
    .where(whereClause)
    return response[0].count;
}