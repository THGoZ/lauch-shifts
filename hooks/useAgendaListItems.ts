import { ShiftWithPatient } from "@/interfaces/interface";
import { returnShiftsWithSections } from "@/services/shifts/shift.helpers";
import { useCallback, useEffect, useState } from "react";

interface ShiftSection {
    title: string;
    data: ShiftWithPatient[];
}

interface AgendaListItem {
    shifts: ShiftWithPatient[];
    week: Date[];
    onDetailsPress: (shiftId: number) => void;
}

export function useAgendaListItems({shifts, week, onDetailsPress}: AgendaListItem) {
    const [agendaItems, setAgendaItems] = useState<any[]>([]);

    useEffect(() => {
        mapShiftstoAgendaItems();
    }, [shifts]);

    const mapShiftstoAgendaItems = useCallback(() => {
        const results = returnShiftsWithSections(
            shifts,
            week
        );
        const items = mapShiftsToItems(results);
        setAgendaItems(items);
    }, [shifts]);

    const mapShiftsToItems = useCallback((shifts: ShiftSection[]) => {
        const itemstoset = shifts.map((shifts) => ({
            title: shifts.title,
            data: shifts.data.map((shift) => ({
                id: shift.id,
                date: shift.date,
                start_time: shift.start_time,
                duration: shift.duration,
                status: shift.status,
                details: shift.details,
                patient: shift.patient,
                onPress: () => onDetailsPress(shift.id),
            })),
        }));
        return itemstoset;
    }, []);

    return {
        agendaItems,
    }

}