import { Status } from "@/constants/enums";
import { ShiftWithPatient } from "@/interfaces/interface";
import { useMemo } from "react";

interface shiftFilters {
    statusFilter: Status;
    shifts: ShiftWithPatient[];
}

export function useShiftsFilter({ statusFilter, shifts }: shiftFilters) {


    const filteredShifts = useMemo(() => {
        return shifts.filter((shift: ShiftWithPatient) => {
            return statusFilter === Status.All || shift.status === statusFilter;
        });
    }, [shifts, statusFilter]);

    return {
        filteredShifts
    }

}