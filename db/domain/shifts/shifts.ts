import { shiftStatus } from "@/constants/enums";
import { db } from "@/db/db";
import type { Shift } from "@/db/schema";
import { patient, shift } from "@/db/schema";
import { CustomError } from "@/domain/entities/error-entity";
import { checkOverLappingAndThrowFields, newOverlapping } from "@/services/shifts/shift.helpers";
import { parseSQLiteErrorFields } from "@/utils/db-error-handlers";
import { and, eq, ne } from "drizzle-orm";
import { countDbQuery } from "../shared/common";
import { buildFilterConditions, buildSearchConditions, Filter, paginationValues } from "../utils/queryHandle";

export class Shifts {

    static async create(data: Omit<Shift, "id">) {
        try {
            const existingShifts = await this.getAllOfDate(data.date);

            checkOverLappingAndThrowFields(existingShifts, data.start_time, data.duration);

            const [created] = await db.insert(shift).values({ ...data, created_at: new Date() }).returning();
            return created;
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            const fields = parseSQLiteErrorFields(error);
            if (fields.length > 0) {
                throw new CustomError("Error al crear turno", fields);
            }
            throw error;
        }
    }

    static async createBulk(data: Omit<Shift, "id">[]) {
        if (data.length === 0) {
            throw new Error("No se pueden crear turnos sin datos.");
        }
        let created = 0;
        try {
            for (const newshift of data) {
                const existingShifts = await this.getAllOfDate(newshift.date);
                const overlappingShift = newOverlapping(existingShifts, newshift.start_time, newshift.duration);
                if (overlappingShift) {
                    throw new Error("El turno se superpone con otro turno existente.");
                }
                await db.insert(shift).values(newshift)
                created++;
            }
            return created;
        } catch (error) {
            console.log("Error creating shift:", error);
            if (error instanceof Error) {
                throw new Error(`Error al crear turno: ${error.message}`);
            }
            throw error;
        }
    }


    static async getAll() {
        try {
            const results = await db
                .select({
                    id: shift.id,
                    patient_id: shift.patient_id,
                    date: shift.date,
                    start_time: shift.start_time,
                    duration: shift.duration,
                    status: shift.status,
                    reason_incomplete: shift.reason_incomplete,
                    details: shift.details,
                    updated_at: shift.updated_at,
                    created_at: shift.created_at,
                    name: patient.name,
                    lastname: patient.lastname,
                })
                .from(shift)
                .leftJoin(patient, eq(shift.patient_id, patient.id))
                .orderBy(shift.start_time);

            return results.map(row => ({
                ...row,
                fullname: row.name && row.lastname ? `${row.name} ${row.lastname}` : '',
            }));
        } catch (error) {
            console.log("Error fetching all shifts:", error);
            if (error instanceof Error) {
                throw new Error(`Error fetching all shifts: ${error.message}`);
            }
            throw error;
        }
    }

    static async getShifts(
        search = "",
        filters: Filter<typeof shift>[] = [],
        include_patient = false,
        page?: number,
        limit?: number,
    ) {
        const searchClause = buildSearchConditions(shift, search, ["patient_id", "date"]);
        const filterClause = buildFilterConditions(shift, filters);

        const whereClause = and(
            ...(searchClause ? [searchClause] : []),
            ...(filterClause ? [filterClause] : [])
        );

        const count = await countDbQuery(shift, whereClause);

        const baseQuery = db
            .select({
                id: shift.id,
                patient_id: shift.patient_id,
                date: shift.date,
                start_time: shift.start_time,
                duration: shift.duration,
                status: shift.status,
                reason_incomplete: shift.reason_incomplete,
                details: shift.details,
                updated_at: shift.updated_at,
                created_at: shift.created_at,
                ...(include_patient
                    ? {
                        patient: {
                            name: patient.name,
                            lastname: patient.lastname,
                            dni: patient.dni,
                            id: patient.id,
                            created_at: patient.created_at,
                            updated_at: patient.updated_at,
                            deleted_at: patient.deleted_at,
                        }
                    }
                    : {}),
            })
            .from(shift)
            .where(whereClause);

        if (include_patient) {
            baseQuery.innerJoin(patient, eq(shift.patient_id, patient.id));
        }

        if (page && limit) {
            const totalPages = paginationValues(page, limit, count);

            if (totalPages < page && page !== 1) {
                throw new Error("Page not found");
            }

            const response = await baseQuery.limit(limit).offset((page - 1) * limit);

            /*             if (include_patient) {
                            const fullresponse = response.map(row => ({
                                ...row,
                                fullname: row.patient_name && row.patient_lastname ? `${row.patient_name} ${row.patient_lastname}` : '',
                            }));
                            return {
                                data: fullresponse,
                                total: count,
                                page: 1,
                                totalPages: 1,
                            };
                        } */

            return {
                data: response,
                total: count,
                page,
                totalPages,
            };
        }

        const response = await baseQuery;

        /*         if (include_patient) {
                    const fullresponse = response.map(row => ({
                        ...row,
                        fullname: row.patient_name && row.patient_lastname ? `${row.patient_name} ${row.patient_lastname}` : '',
                    }));
                    return {
                        data: fullresponse,
                        total: count,
                        page: 1,
                        totalPages: 1,
                    };
                } */


        return {
            data: response,
            total: count,
            page: 1,
            totalPages: 1,
        };
    }

    static async getPureShifts() {
        try {
            const results = await db.select().from(shift).orderBy(shift.start_time);
            return results;
        } catch (error) {
            console.log("Error fetching pure shifts:", error);
            if (error instanceof Error) {
                throw new Error(`Error fetching pure shifts: ${error.message}`);
            }
            throw error;
        }
    }


    static async getById(id: number) {
        const [found] = await db.select().from(shift).where(eq(shift.id, id));
        return found;
    }

    static async update(id: number, data: Partial<Omit<Shift, "id">>) {
        try {
            const existingShift = await this.getById(id);
            if (existingShift.date !== data.date || existingShift.start_time !== data.start_time || existingShift.duration !== data.duration) {
                const existingShifts = await this.getAllOfDate(data.date ?? existingShift.date);
                checkOverLappingAndThrowFields(existingShifts, data.start_time ?? existingShift.start_time, data.duration ?? existingShift.duration);
            }
            const [updated] = await db
                .update(shift)
                .set({
                    ...data,
                    updated_at: new Date(),
                })
                .where(eq(shift.id, id))
                .returning();
            return updated;
        } catch (error) {
            const fields = parseSQLiteErrorFields(error);
            if (fields.length > 0) {
                throw new CustomError("Error al actualizar turno", fields);
            }
            throw error;
        }
    }

    static async delete(id: number) {
        try {
            await db.delete(shift).where(eq(shift.id, id));
            return true;
        } catch (error) {
            const fields = parseSQLiteErrorFields(error);
            throw new CustomError("Error al eliminar turno", fields, error);
        }
    }

    static async getAllOfDate(date: string) {
        try {

            const results = await db
                .select()
                .from(shift)
                .where(eq(shift.date, date))
                .leftJoin(patient, eq(shift.patient_id, patient.id))
                .orderBy(shift.start_time);

            return results.map(({ shift, patient }) => ({
                ...shift,
                fullname: patient ? `${patient.name} ${patient.lastname}` : "",
            }));
        } catch (error) {
            console.log("Error fetching shifts:", error);
            if (error instanceof Error) {
                throw new Error(`Error fetching shifts: ${error.message}`);
            }
            throw error;
        }
    }

    static async countActiveShifts(): Promise<number> {
        try {
            const results = await db
                .$count(shift, ne(shift.status, shiftStatus.CANCELLED))

            return results;
        }
        catch (error) {
            console.log("Error fetching shifts:", error);
            if (error instanceof Error) {
                throw new Error(`Error fetching shifts: ${error.message}`);
            }
            throw error;
        }
    }
}