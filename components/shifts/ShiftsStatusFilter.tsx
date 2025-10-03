import { useThemeColors } from "@/hooks/useThemeColors";
import { ShiftWithPatient } from "@/interfaces/interface";
import React, { useCallback } from "react";
import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import ThemedRadioList, { RadioOption } from "../ThemedRadioList";

enum Status {
  Confirmed = "confirmed",
  Pending = "pending",
  Canceled = "canceled",
  All = "all",
}

interface ShiftsStatusFilterProps {
  shifts: ShiftWithPatient[];
  setStatusFilter: (value: Status) => void;
}

const ShiftsStatusFilter = ({shifts, setStatusFilter}: ShiftsStatusFilterProps) => {
  const colors = useThemeColors();
  const selectedIndex = useSharedValue(0);

  const onToggleStatus = useCallback(
    (status: Status) => {
      setStatusFilter(status);
    },
    []
  );

  const basicOptions: RadioOption[] = [
    {
      label: shifts.length.toString(),
      description: "All",
      value: Status.All,
      thumbColor: colors.primary,
    },
    {
      label: shifts.filter((s) => s.status === "confirmed").length.toString(),
      description: "Confirmed",
      value: Status.Confirmed,
      thumbColor: colors.success,
    },
    {
      label: shifts.filter((s) => s.status === "pending").length.toString(),
      description: "Pending",
      value: Status.Pending,
      thumbColor: colors.warning,
    },
    {
      label: shifts.filter((s) => s.status === "canceled").length.toString(),
      description: "Canceled",
      value: Status.Canceled,
      thumbColor: colors.destructive,
    },
  ];

  return (
    <View>
      <ThemedRadioList
        items={basicOptions}
        size="medium"
        selectedIndex={selectedIndex}
        onPress={(value) => {
          onToggleStatus(value);
        }}
      />
    </View>
  );
};

export default ShiftsStatusFilter;
