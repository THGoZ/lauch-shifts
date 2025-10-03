import { useThemeColors } from "@/hooks/useThemeColors";
import { ShiftWithPatient } from "@/interfaces/interface";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface ShiftsStatusCountProps {
  selectedDate: string;
  shiftsOfDate: ShiftWithPatient[];
}

const ShiftsStatusCount = ({selectedDate, shiftsOfDate}: ShiftsStatusCountProps) => {
  const colors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        statsBar: {
          flexDirection: "row",
          backgroundColor: colors.background,
          paddingVertical: 16,
          paddingHorizontal: 20,
        },
        statItem: {
          flex: 1,
          alignItems: "center",
        },
        statNumber: {
          fontSize: 20,
          fontWeight: "bold",
          marginBottom: 2,
        },
        statLabel: {
          fontSize: 12,
          fontWeight: "500",
        },
        statDivider: {
          width: 1,
          backgroundColor: colors.border,
          marginHorizontal: 16,
        },
      }),
    [colors]
  );
  return (
    <View style={styles.statsBar}>
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: colors.success }]}>
          {
            shiftsOfDate.filter(
              (s) => s.status === "confirmed" && s.date === selectedDate
            ).length
          }
        </Text>
        <Text style={[styles.statLabel, { color: colors.success }]}>
          Confirmed
        </Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: colors.warning }]}>
          {
            shiftsOfDate.filter(
              (s) => s.status === "pending" && s.date === selectedDate
            ).length
          }
        </Text>
        <Text style={[styles.statLabel, { color: colors.warning }]}>
          Pending
        </Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={[styles.statNumber, { color: colors.destructive }]}>
          {
            shiftsOfDate.filter(
              (s) => s.status === "canceled" && s.date === selectedDate
            ).length
          }
        </Text>
        <Text style={[styles.statLabel, { color: colors.destructive }]}>
          Canceled
        </Text>
      </View>
    </View>
  );
};

export default ShiftsStatusCount;
