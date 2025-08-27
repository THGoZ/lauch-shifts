import { db } from "@/db/db";
import { patient, Patient as PatientType } from "@/db/schema";
import { CustomError } from "@/domain/entities/error-entity";

import { PagedResult } from "@/interfaces/interface";
import { parseSQLiteErrorFields } from "@/utils/db-error-handlers";
import { and, asc, desc, eq } from "drizzle-orm";
import { countDbQuery } from "../shared/common";
import { buildFilterConditions, buildSearchConditions, Filter, paginationValues, SortValue } from "../utils/queryHandle";

export class Patient {

    static async getAll(
        search = "",
        page = 1,
        limit = 10,
        filters: Filter<typeof patient>[] = [],
        sort: SortValue<typeof patient> = { field: "name", order: "desc" }
    ): Promise<PagedResult<PatientType>> {

        const normalizedFilters = filters.map(f => {
            if (f.field === "created_at" && typeof f.value === "string") {
                return { ...f, value: new Date(f.value) };
            }
            return f;
        });

        const searchClause = buildSearchConditions(patient, search, ["name", "lastname"]);
        const filterClause = buildFilterConditions(patient, normalizedFilters);
        console.log(filters);
        const whereClause = and(
            ...(searchClause ? [searchClause] : []),
            ...(filterClause ? [filterClause] : []),
        );

        const count = await countDbQuery(patient, whereClause);

        const totalPages = paginationValues(page, limit, count);

        if (totalPages < page && page !== 1) {
            throw new Error("Page not found");
        }

        const response = await db
            .select()
            .from(patient)
            .where(whereClause)
            .limit(limit)
            .offset((page - 1) * limit)
            .orderBy(sort.order === "asc" ? asc(patient[sort.field] as any) : desc(patient[sort.field] as any));

        return {
            data: response,
            total: count,
            page,
            totalPages,
        }
    }

    static async getById(id: number): Promise<PatientType> {
        const response = await db.select().from(patient).where(eq(patient.id, id)).limit(1);
        return response[0];
    }

    static async create(newPatient: PatientType): Promise<PatientType> {
        try {
            const response = await db.insert(patient).values([{
                name: newPatient.name,
                lastname: newPatient.lastname,
                dni: newPatient.dni,
                created_at: new Date(),
            }]).returning();
            return response[0]
        } catch (error) {
            const fields = parseSQLiteErrorFields(error);
            throw new CustomError("Failed to create patient", fields);
        }
    }

    static async update(updatedPatient: PatientType): Promise<PatientType> {
        try {
            const response = await db.update(patient)
                .set({
                    name: updatedPatient.name,
                    lastname: updatedPatient.lastname,
                    dni: updatedPatient.dni,
                    updated_at: new Date(),
                })
                .where(eq(patient.id, updatedPatient.id as number))
                .returning();
            return response[0];
        } catch (error) {
            const fields = parseSQLiteErrorFields(error);
            throw new CustomError("Failed to create patient", fields);
        }
    }

    static async delete(patientId: number): Promise<void> {
        try {
            await db.delete(patient).where(eq(patient.id, patientId));
        } catch (error) {
            const fields = parseSQLiteErrorFields(error);
            throw new CustomError("Failed to delete patient", fields);
        }
    }

    static async countPatients(): Promise<number> {
        try {
            const response = await db.$count(patient);
            return response;
        } catch (error) {
            const fields = parseSQLiteErrorFields(error);
            throw new CustomError("Failed to count patients", fields);
        }
    }
}