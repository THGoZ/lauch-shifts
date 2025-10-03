import { useThemeColors } from "@/hooks/useThemeColors";
import React from "react";
import { TimelineList, TimelineProps } from "react-native-calendars";
import ShiftEventDisplay from "../ShiftEventDisplay";

const INITIAL_TIME = { hour: 8, minutes: 0 };

interface ShiftsTimeLineCalendarProps {
  events: {
    [date: string]: TimelineProps["events"];
  };
  onDetailsPress: (shiftId: number) => void;
}

const ShiftsTimeLineCalendar = ({ events, onDetailsPress }: ShiftsTimeLineCalendarProps) => {
  const colors = useThemeColors();
  const timelineProps: Partial<TimelineProps> = {
    format24h: true,
    overlapEventsSpacing: 8,
    onEventPress(event) {
      if (event.id !== undefined) {
        onDetailsPress(Number(event.id));
      }
    },
    renderEvent: (event) => {
      return <ShiftEventDisplay key={event.id} shift={event} />;
    },
    rightEdgeSpacing: 24,
    timelineLeftInset: 92,
    theme: {
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
      timeLabel: {
        fontSize: 14,
        color: colors.foreground,
      },
      verticalLine: {
        backgroundColor: colors.border,
      },
      line: {
        backgroundColor: colors.border,
      },
      event: {
        borderRightWidth: 6,
        borderwidth: 1,
        borderColor: colors.accent,
        backgroundColor: colors.primary,
        borderRadius: 20,
        shadowColor: colors.primary,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      },
    },
  };

  return (
    <TimelineList
      events={events}
      timelineProps={timelineProps}
      showNowIndicator
      // scrollToNow
      scrollToFirst
      initialTime={INITIAL_TIME}
    />
  );
};

export default ShiftsTimeLineCalendar;
