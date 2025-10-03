import { useCallback, useState } from "react";
import { DateData } from "react-native-calendars";

export function useCalendarDates() {
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split("T")[0]
    );
    const [selectedMonth, setSelectedMonth] = useState<string>(
        new Date().toISOString().split("T")[0])
        ;

    const onMonthChange = useCallback((date: DateData) => {
        setSelectedMonth(date.dateString);
    }, []);

    const onDateChanged = useCallback(
        (date: string) => {
            setSelectedDate(date);
        },
        []
    );

    return {
        selectedDate,
        selectedMonth,
        onDateChanged,
        onMonthChange,
    }
}