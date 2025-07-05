import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import DateTimePicker from "react-native-ui-datepicker";

interface CustomCalendarProps {
  onChange: (date: Date) => void;
  currentDate?: Date;
  maxDate?: Date;
  minDate?: Date;
  isValid?: boolean;
  disabled?: boolean;
}

const CustomCalendar = ({
  onChange,
  currentDate,
  maxDate,
  minDate,
  isValid = true,
  disabled = false,
}: CustomCalendarProps) => {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: !isValid ? colors.destructive : colors.border,
      shadowColor: colors.foreground,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    containerError: {
      borderColor: colors.destructive,
      backgroundColor: colors.destructiveMuted,
    },
    containerDisabled: {
      opacity: 0.6,
    },
    header: {
      marginTop: 12,
      padding: 8,
      backgroundColor: isValid
        ? "rgba(64, 224, 208, 0.2)"
        : "rgba(239, 68, 68, 0.2)",
      borderBottomEndRadius: 14,
      borderBottomStartRadius: 14,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: !isValid ? colors.destructiveForeground : colors.mutedForeground,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 14,
      color: !isValid ? colors.destructiveForeground : colors.mutedForeground,
      textAlign: "center",
      marginTop: 4,
    },
  });

  // Animation values
  const shakeX = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Animation functions
  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(-2, { duration: 50 }),
      withTiming(2, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const animateSelection = () => {
    scaleValue.value = withSequence(
      withTiming(0.98, { duration: 200 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
  };

  // Handle date change with animation
  const handleDateChange = (params: any) => {
    if (disabled) return;
    animateSelection();

    const selectedDate = params.date
      ? new Date(params.date.toString())
      : new Date();
    onChange(selectedDate);
  };

  // Update disabled animation
  useEffect(() => {
    opacity.value = withTiming(disabled ? 0.6 : 1, { duration: 200 });
  }, [disabled]);

  // Trigger shake on error
  useEffect(() => {
    if (!isValid) {
      triggerShake();
    }
  }, [isValid]);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }, { scale: scaleValue.value }],
    opacity: opacity.value,
  }));

  // Format current date for display
  const formatLongDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        !isValid && styles.containerError,
        disabled && styles.containerDisabled,
        animatedStyle,
      ]}
    >
      <DateTimePicker
        components={{
          IconNext: (
            <Ionicons
              name="chevron-forward-outline"
              color={colors.accent}
              size={26}
            />
          ),
          IconPrev: (
            <Ionicons
              name="chevron-back-outline"
              color={colors.accent}
              size={26}
            />
          ),
        }}
        classNames={{
          month_selector_label: `capitalize`,
        }}
        style={{
          backgroundColor: colors.background,
          borderTopStartRadius: 16,
          borderTopEndRadius: 16,
        }}
        styles={{
          selected: {
            backgroundColor: isValid ? colors.accent : colors.destructive,
            borderWidth: 1,
            borderColor: isValid ? colors.accent : colors.destructiveMuted,
            borderRadius: 18,
          },
          selected_label: {
            color: isValid
              ? colors.accentForeground
              : colors.destructiveForeground,
          },
          day: { backgroundColor: colors.background },
          day_label: { color: colors.foreground },
          disabled_label: { color: colors.muted },
          outside_label: { color: colors.mutedForeground },
          year_selector_label: {
            color: colors.mutedForeground,
            fontSize: 15,
            fontWeight: "bold",
          },
          year_selector: {
            marginVertical: 4,
            padding: 4,
            backgroundColor: "rgba(64, 224, 208, 0.1)",
            borderRadius: 6,
            shadowColor: "#000",
            shadowOffset: { width: -1, height: -1 }, // flip direction
            shadowOpacity: 0.4,
            shadowRadius: 2,
          },
          month_selector_label: {
            color: colors.mutedForeground,
            fontSize: 15,
            fontWeight: "bold",
          },
          month_selector: {
            marginVertical: 4,
            padding: 4,
            backgroundColor: "rgba(64, 224, 208, 0.1)",
            borderRadius: 6,
            shadowColor: "#000",
            shadowOffset: { width: -1, height: -1 }, // flip direction
            shadowOpacity: 0.4,
            shadowRadius: 2,
          },
          today: {
            borderWidth: 2,
            borderColor: colors.secondary,
            borderRadius: 18,
          },
          today_label: { color: colors.foreground },
          weekday_label: { color: colors.primary, fontSize: 15 },
          year_label: { color: colors.foreground },
          selected_year: { backgroundColor: colors.primary },
          selected_year_label: { color: colors.primaryForeground },
          month: { color: colors.foreground },
          month_label: { color: colors.foreground },
          selected_month: { backgroundColor: colors.primary },
          selected_month_label: { color: colors.primaryForeground },
          header: {
            backgroundColor: isValid
              ? "rgba(64, 224, 208, 0.2)"
              : "rgba(239, 68, 68, 0.2)",
            shadowColor: "#000",
            borderTopStartRadius: 16,
            borderTopEndRadius: 16,
            paddingHorizontal: 8,
          },
          weekdays: {
            marginVertical: 10,
          },
        }}
        maxDate={maxDate ? maxDate : ""}
        minDate={minDate ? minDate : ""}
        showOutsideDays={true}
        mode="single"
        onChange={(date) => handleDateChange(date)}
        date={currentDate}
        locale="es"
      />
      {/* Header with current selection */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {currentDate ? formatLongDate(currentDate.toString()) : "Select Date"}
        </Text>
        {!isValid && (
          <Text style={styles.subtitle}>Please select a valid date</Text>
        )}
      </View>
    </Animated.View>
  );
};

export default CustomCalendar;
