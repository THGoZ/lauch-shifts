import { useThemeColors } from "@/hooks/useThemeColors";
import { formatIsoToTime } from "@/services/shifts/shift.helpers";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Event } from "react-native-calendars/src/timeline/EventBlock";

interface ShiftEventDisplayProps {
  shift: Event;
}

const ShiftEventDisplay = ({ shift }: ShiftEventDisplayProps) => {
  const colors = useThemeColors();

  const obtainColor = (color: string) => {
    switch (color) {
      case colors.warning:
        return colors.warningForeground;
      case colors.success:
        return colors.successForeground;
      case colors.destructive:
        return colors.destructiveForeground;
      default:
        return colors.primaryForeground;
    }
  };

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          marginHorizontal: 10,
          height: "100%",
          width: "100%",
          alignContent: "center",
          justifyContent: "center",
          overflow: "hidden",
        },
        wrapContainer: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 10,
          flexWrap: "wrap",
        },
        rowDetailsContainer: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 5,
        },
        rowDetailsText: {
          fontSize: 16,
          color: obtainColor(shift.color ?? colors.primary),
        },
      }),
    [colors]
  );

  return (
    <View key={shift.id} style={styles.container}>
      <View style={styles.wrapContainer}>
        <View style={styles.rowDetailsContainer}>
          <Ionicons name="person-outline" size={16} color={colors.accent} />
          <Text style={styles.rowDetailsText}>{shift.title}</Text>
        </View>
        <View style={styles.rowDetailsContainer}>
          <Ionicons name="time-outline" size={16} color={colors.accent} />
          <Text style={styles.rowDetailsText}>
            {formatIsoToTime(shift.start)} -
          </Text>
          <Text style={styles.rowDetailsText}>
            {formatIsoToTime(shift.end)}
          </Text>
        </View>
      </View>
      <View style={styles.rowDetailsContainer}>
        <Ionicons name="help-circle-outline" size={16} color={colors.accent} />
        <Text ellipsizeMode="tail" numberOfLines={1} style={styles.rowDetailsText}>{shift.summary}</Text>
      </View>
    </View>
  );
};

export default ShiftEventDisplay;
