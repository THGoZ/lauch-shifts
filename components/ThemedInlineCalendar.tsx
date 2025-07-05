import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { Calendar } from "react-native-calendars";

interface ThemedCalendarProps {
  onDayPress: (day: any) => void;
  minDate: string;
  value: any;
  isValid?: boolean;
}

const ThemedInlineCalendar = ({
  onDayPress,
  minDate,
  value,
  isValid = true,
}: ThemedCalendarProps) => {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    calendarContainer: {
      backgroundColor: colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isValid ? colors.border : colors.destructive,
      overflow: "hidden",
    },
  });

  return (
    <View style={styles.calendarContainer}>
      <Calendar
        onDayPress={(day) => {
          onDayPress(day);
        }}
        minDate={minDate}
        renderArrow={(direction) => {
          return (
            <Ionicons
              name={direction === "left" ? "chevron-back" : "chevron-forward"}
              size={24}
              color={colors.accent}
            />
          );
        }}
        theme={{
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
        markedDates={
          value
            ? {
                [value]: {
                  selected: true,
                  selectedColor: isValid ? colors.primary : colors.destructive,
                  selectedTextColor: isValid ? colors.primaryForeground : colors.destructiveForeground,
                },
              }
            : {}
        }
      />
    </View>
  );
};

export default ThemedInlineCalendar;
