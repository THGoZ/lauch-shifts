import { useShifts } from "@/context/ShiftsContext";
import { useToast } from "@/context/ToastContext";
import { CompareFilter, Filter } from "@/db/domain/utils/queryHandle";
import { shift } from "@/db/schema";
import { ShiftWithPatient } from "@/interfaces/interface";
import { checkIfDateIsInRange, getWeekRange } from "@/services/shifts/shift.helpers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface UseWeeklyShiftsProps {
    selectedDate: string;
    patientId?: string;
}

export function useWeeklyShifts({ selectedDate, patientId }: UseWeeklyShiftsProps) {
    const week = useRef<Date[]>(getWeekRange(new Date(selectedDate)));
    const [shiftsOfWeek, setShiftsOfWeek] = useState<ShiftWithPatient[]>([]);
    const { getShifts } = useShifts();
    const shifsOfDate = useMemo(() => {
        return shiftsOfWeek.filter(shift => shift.date === selectedDate);
    }, [shiftsOfWeek, selectedDate]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { showToast } = useToast();
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    const loadShifts = async () => {
        setIsLoading(true);
        const patientFilter: Filter<typeof shift>[] = [];
        const compareFilters: CompareFilter<typeof shift>[] = [
            {
                field: "date",
                value: week.current[0].toISOString().split("T")[0],
                compare: "gte",
            },
            {
                field: "date",
                value: week.current[6].toISOString().split("T")[0],
                compare: "lte",
            },
        ];
        if (patientId) {
            patientFilter.push({
                field: "patient_id",
                value: patientId,
            });
        }
        const response = await getShifts(
            undefined,
            patientFilter,
            true,
            undefined,
            undefined,
            compareFilters
        );
        if (!response.success) {
            showToast("error", "Error loading shifts", response.error.message);
        } else {
            setShiftsOfWeek(response.result.data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        const fetchShifts = async () => {
            await loadShifts();
        };
        const currentDate = new Date(selectedDate);
        const shouldUpdate = checkIfDateIsInRange(currentDate, week.current);
        if (!shouldUpdate) {
            return;
        }
        const newRange = getWeekRange(currentDate);
        week.current = newRange;
        fetchShifts();
    }, [selectedDate]);

    const refreshShifts = useCallback(async () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        await loadShifts();
        setIsRefreshing(false);
    }, []);

    return {
        week,
        shiftsOfWeek,
        shifsOfDate,
        isLoading,
        isRefreshing,
        refreshShifts
    }
}