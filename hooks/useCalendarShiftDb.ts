import { CompareFilter, Filter } from "@/db/domain/utils/queryHandle";
import { shift } from "@/db/schema";
import { ShiftWithPatient } from "@/interfaces/interface";
import { useCallback, useEffect, useState } from "react";
import { useShiftsDb } from "./useShiftsDb";

interface UseCalendarShiftDbProps {
    selectedMonth: string;
    patientId?: string;
}

export function useCalendarShiftDb({ selectedMonth, patientId }: UseCalendarShiftDbProps) {
    const [shiftsOfMonth, setShiftsOfMonth] = useState<ShiftWithPatient[]>([]);
    const { getShifts } = useShiftsDb();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchShifts = async () => {
            await getShiftsOfMonth();
        };
        fetchShifts();
    }, [selectedMonth]);

    async function getShiftsOfMonth() {
        setIsLoading(true);
        const month = new Date(selectedMonth);
        const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
        const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        const patientFilter: Filter<typeof shift>[] = [];
        const monthFilter: CompareFilter<typeof shift>[] = [
            {
                field: "date",
                value: firstDay.toISOString().split("T")[0],
                compare: "gte",
            },
            {
                field: "date",
                value: lastDay.toISOString().split("T")[0],
                compare: "lte",
            },
        ];
        if(patientId) {
            patientFilter.push({
                field: "patient_id",
                value: patientId,
            });
        }
        const shifts = await getShifts(
            undefined,
            patientFilter,
            false,
            undefined,
            undefined,
            monthFilter,
            false
        );
        if (!shifts.success) {
            setError(shifts.error);
        } else {
            setShiftsOfMonth(shifts.result.data);
            setError(null);
        }
        setIsLoading(false);
    }

    const refreshShifts = useCallback(async () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        await getShiftsOfMonth();
        setIsRefreshing(false);
    }, []);


    return {
        shiftsOfMonth,
        isLoading,
        error,
        refreshShifts
    }
}