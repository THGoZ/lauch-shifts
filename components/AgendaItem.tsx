import { useThemeColors } from "@/hooks/useThemeColors";
import {
  durationAddition,
  formatTime
} from "@/services/shifts/shift.helpers";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ItemProps {
  item: any;
}

const AgendaItem = (props: ItemProps) => {
  const { item } = props as any;
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    shiftCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      marginHorizontal: 8,
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.foreground,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    firstShiftCard: {
      marginTop: 16,
    },
    shiftHeader: {
      flexDirection: "row",
      alignItems: "center",
    },
    timeContainer: {
      marginRight: 16,
      alignItems: "center",
      minWidth: 60,
    },
    shiftTime: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.foreground,
    },
    shiftDuration: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 2,
    },
    shiftInfo: {
      flex: 1,
      alignItems: "center",
    },
    patientName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.foreground,
      marginBottom: 2,
    },
    patientDni: {
      fontSize: 12,
      color: colors.mutedForeground,
    },
    statusContainer: {
      alignItems: "center",
      minWidth: 70,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "500",
      marginTop: 2,
    },
    reasonContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    reasonText: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontStyle: "italic",
    },
    emptyDate: {
      height: 120,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 32,
    },
    emptyDateText: {
      fontSize: 16,
      color: colors.mutedForeground,
      marginTop: 8,
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return colors.success;
      case "pending":
        return colors.warning;
      case "canceled":
        return colors.destructive;
      default:
        return colors.mutedForeground;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return "checkmark-circle";
      case "pending":
        return "time";
      case "canceled":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const getfullName = () => {
    if (item.patient) {
      return item.patient.name + " " + item.patient.lastname;
    }
    return "Unknown Patient";
  };

  const statusColor = getStatusColor(item.status);
  const statusIcon = getStatusIcon(item.status);
  const endTime = durationAddition(item.start_time, item.duration);

  const buttonPressed = useCallback(() => {
    if(item.onPress) {
      item.onPress();
    }
  }, []);

  const itemPressed = useCallback(() => {
    Alert.alert(item.id.toString());
  }, [item]);

  if (!item) {
    return (
      <View style={styles.emptyDate}>
        <Ionicons
          name="calendar-outline"
          size={32}
          color={colors.mutedForeground}
        />
        <Text style={styles.emptyDateText}>No shifts scheduled</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.shiftCard /* , isFirst && styles.firstShiftCard */]}
      onPress={() => buttonPressed()}
      onLongPress={() => itemPressed()}
      activeOpacity={0.7}
    >
      <View style={styles.shiftHeader}>
        <View style={styles.timeContainer}>
          <Text style={styles.shiftTime}>
            {formatTime(item.start_time)} 
          </Text>
          <Text style={styles.shiftTime}>
            {endTime}
          </Text>
        </View>

        <View style={styles.shiftInfo}>
          <Text style={styles.patientName}>
            {getfullName()}
          </Text>
          <Text style={styles.patientDni}>DNI: {item.patient ? item.patient.dni : "Unknown"}</Text>
        </View>

        <View style={styles.statusContainer}>
          <Ionicons name={statusIcon as any} size={20} color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(AgendaItem, (prev, next) => {
  return prev.item.id === next.item.id;
});
