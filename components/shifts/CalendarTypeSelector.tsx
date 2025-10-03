import { useThemeColors } from "@/hooks/useThemeColors";
import React from "react";
import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import ThemedRadioList from "../ThemedRadioList";

interface CalendarTypeSelectorProps {
  selectedCalendarType: "Agenda" | "Timeline";
  setCalendarType: (value : "Agenda" | "Timeline") => void;
}

const CalendarTypeSelector = ({selectedCalendarType, setCalendarType}: CalendarTypeSelectorProps) => {
  const selectedCalendarIndex = useSharedValue(selectedCalendarType === "Agenda" ? 0 : 1);

  const onSelectedOptionChange = (value: string) => {
    setCalendarType(value as "Agenda" | "Timeline");
    selectedCalendarIndex.value = value === "Agenda" ? 0 : 1;
  };

  const colors = useThemeColors();
  return (
    <View style={{ gap: 10 }}>
      <ThemedRadioList
        items={[
          {
            label: "Agenda",
            value: "Agenda",
            thumbColor: colors.accent,
          },
          {
            label: "Timeline",
            value: "Timeline",
            thumbColor: colors.accent,
          },
        ]}
        onPress={onSelectedOptionChange}
        size="medium"
        selectedIndex={selectedCalendarIndex}
      />
    </View>
  );
};

export default CalendarTypeSelector;
