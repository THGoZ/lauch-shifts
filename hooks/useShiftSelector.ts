import { useToast } from "@/context/ToastContext";
import { ShiftWithPatient } from "@/interfaces/interface";
import { useState } from "react";
import { useShiftsDb } from "./useShiftsDb";

export function useShiftSelector() {
    const [selectedShift, setSelectedShift] = useState<ShiftWithPatient | null>(null);
    const isVisible = selectedShift ? true : false;
    const { getShiftById } = useShiftsDb();
    const {showToast} = useToast();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const setShift = async (shiftId: number) => {
        setIsLoading(true);
        const response = await getShiftById(shiftId);
        if(response.result === null) {
            showToast("error", "Error when selecting shift", "Shift not found");
            setIsLoading(false);
            return;
        }
        if (!response.success) {
            showToast("error", "Error when selecting shift", response.error.message);
        } else {
            setSelectedShift(response.result);
        }
        setIsLoading(false);
    }

    const resetShift = () => {
        setSelectedShift(null);
    }

    return {
        selectedShift,
        isVisible,
        isLoading,
        setShift,
        resetShift,
    }
}