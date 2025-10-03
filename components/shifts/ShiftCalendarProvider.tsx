import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { CalendarProvider, ExpandableCalendar } from "react-native-calendars";
import { DateData, MarkedDates } from "react-native-calendars/src/types";

interface ShiftCalendarProviderProps {
  selectedDate?: string;
  selectedMonth: string;
  onDateChanged: (date: string) => void;
  onMonthChange: (date: DateData) => void;
  markedDates: MarkedDates;
  isLoading: boolean;
  children: React.ReactNode;
}

export default function ShiftCalendarProvider({
  markedDates,
  children,
  selectedDate,
  onDateChanged,
  onMonthChange,
  isLoading
}: ShiftCalendarProviderProps) {
  const colors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        calendarContainer: {
          backgroundColor: colors.background,
          overflow: "hidden",
          borderBottomWidth: 1,
          borderColor: colors.border,
          borderBottomStartRadius: 12,
          borderBottomEndRadius: 12,
        },
      }),
    [colors]
  );

  const MonthChanged = useCallback((date: DateData) => {
    onMonthChange(date);
  }, []);

  const DateChanged = useCallback((date: string) => {
    onDateChanged(date);
  }, []);

  return (
    <CalendarProvider
      date={selectedDate || ""}
      onDateChanged={DateChanged}
      onMonthChange={MonthChanged}
      showTodayButton
    >
      <View style={styles.calendarContainer}>
        <ExpandableCalendar
          markedDates={markedDates}
          displayLoadingIndicator={isLoading}
          renderArrow={(direction) => {
            return (
              <Ionicons
                name={
                  direction === "right"
                    ? "chevron-forward-outline"
                    : "chevron-back-outline"
                }
                size={28}
                color={colors.accent}
              />
            );
          }}
          theme={{
            indicatorColor: colors.accent,
            backgroundColor: colors.background,
            calendarBackground: colors.background,
            textSectionTitleColor: colors.foreground,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: colors.primaryForeground,
            todayTextColor: colors.primary,
            dayTextColor: colors.foreground,
            textDisabledColor: colors.mutedForeground,
            arrowColor: colors.primary,
            monthTextColor: colors.foreground,
            textDayFontWeight: "500",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "600",
          }}
          headerStyle={{
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
          firstDay={1}
        />
      </View>
      {children}
    </CalendarProvider>
  );
}
