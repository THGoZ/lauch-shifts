import { ShiftWithPatient } from "@/interfaces/interface";
import { mapShiftsToEvents } from "@/services/shifts/shift.helpers";
import { useCallback, useEffect, useState } from "react";
import { CalendarUtils } from "react-native-calendars";

interface UseShiftTimelineEventsProps {
    shiftsOfDate: ShiftWithPatient[];
    selectedDate: string;
}

export function useShiftTimelineEvents({ shiftsOfDate, selectedDate }: UseShiftTimelineEventsProps) {
    const initialEvents = mapShiftsToEvents(
        CalendarUtils.getCalendarDateString(selectedDate),
        shiftsOfDate
    );

    const [timeLineEvents, setTimeLineEvents] = useState<any>(initialEvents);

    useEffect(() => {
        updateEvents();
    }, [shiftsOfDate]);

    const updateEvents = useCallback(
        () => {
            setTimeLineEvents(
                mapShiftsToEvents(
                    CalendarUtils.getCalendarDateString(selectedDate),
                    shiftsOfDate
                )
            );
        },
        [selectedDate, shiftsOfDate]
    );

    return {
        timeLineEvents,
    }

}