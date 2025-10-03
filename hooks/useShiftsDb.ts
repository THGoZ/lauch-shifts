import { Shifts as ShiftsDB } from "@/db/domain/shifts/shifts";
import { CompareFilter, Filter } from "@/db/domain/utils/queryHandle";
import { shift } from "@/db/schema";
import { returnResult } from "@/domain/entities/db-result";
import { PagedResult, ResultItem, ShiftWithPatient } from "@/interfaces/interface";

export function useShiftsDb() {

    async function getShifts(
        search?: string,
        filters?: Filter<typeof shift>[],
        include_patient = true,
        page?: number,
        limit?: number,
        compareFilters?: CompareFilter<typeof shift>[],
        updateShifts: boolean = true): Promise<ResultItem<PagedResult<ShiftWithPatient>>> {
        const response = await ShiftsDB.getShifts(
            search,
            filters,
            include_patient,
            page,
            limit,
            compareFilters
        );
        return returnResult("Patientes obtenidos correctamente", true, response);
    }

    async function getShiftById(
        id: number
    ): Promise<ResultItem<ShiftWithPatient>> {
        try {
            const response = await ShiftsDB.getById(id);
            return returnResult("Turno obtenido correctamente", true, response);
        } catch (error) {
            if (error instanceof Error) {
                return returnResult(error.message, false, null, error);
            }
            return returnResult("Error al obtener el paciente", false, null, error);
        };
    }

    async function deleteShift(id: number): Promise<ResultItem<boolean>> {
        try{
        const response = await ShiftsDB.delete(id);
        return returnResult("Turno eliminado correctamente", true, response);
        } catch (error) {
            if (error instanceof Error) {
                return returnResult(error.message, false, null, error);
            }
            return returnResult("Error al eliminar el turno", false, null, error);
        };
    }

    return {
        getShifts,
        getShiftById,
        deleteShift
    }
}