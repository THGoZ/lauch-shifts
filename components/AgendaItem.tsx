import { useThemeColors } from "@/hooks/useThemeColors";
import { durationAddition, formatTime } from "@/services/shifts/shift.helpers";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import ThemedFlipCard from "./ThemedFlipCard";

interface ItemProps {
  item: any;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onSelectToggle?: (itemId: string | number) => void;
  selectItem?: (itemId: string | number) => void;
}

const AgendaItem = (props: ItemProps) => {
  const { item, isSelectMode, isSelected, selectItem, onSelectToggle } =
    props as any;
  const colors = useThemeColors();
  const selectionTransition = useSharedValue<boolean>(false);

  useEffect(() => {
    selectionTransition.value = isSelected;
  }, [isSelected]);

  const borderAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      Number(selectionTransition.value),
      [0, 1],
      [colors.primary, colors.primaryAccent]
    );
    const colorValue = withTiming(color, { duration: 200 });
    return {
      borderColor: colorValue,
    };
  });

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      Number(selectionTransition.value),
      [0, 1],
      [colors.background, colors.muted]
    );
    const colorValue = withTiming(color, { duration: 200 });
    return {
      backgroundColor: colorValue,
    };
  });

  const styles = useMemo(
    () =>
      StyleSheet.create({
        shiftCard: {
          backgroundColor: colors.background,
          borderRadius: 12,
          padding: 16,
          marginHorizontal: 8,
          marginVertical: 8,
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
        },
        containerCard: {
          backgroundColor: colors.background,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 16,
          marginHorizontal: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: colors.foreground,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        },
        flippedContainerCard: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginHorizontal: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "trasparent",
          shadowColor: colors.foreground,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
        },
        flippedCardBorder: {
          borderWidth: isSelected ? 2 : 1,
          borderRadius: 16,
          marginBottom: 12,
          marginHorizontal: 16,
        },
        flippedCardContent: {
          flex: 1,
          flexGrow: 1,
          flexDirection: "row",
          padding: 16,
          borderWidth: 1,
          borderRadius: 16,
        },
        cardContent: {
          flex: 1,
          flexGrow: 1,
          flexDirection: "row",
        },
      }),
    [colors, isSelected]
  );

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
    if (isSelectMode) {
      selectItem(item.id as any);
      return;
    }
    if (item.onPress) {
      item.onPress();
    }
  }, [item.onPress, onSelectToggle]);

  const itemPressed = useCallback(() => {
    onSelectToggle(item.id as any);
  }, [item]);

  if (!item || Object.keys(item).length === 0 || !item.id) {
    return (
      <View style={styles.emptyDate}>
        <Ionicons
          name="calendar-outline"
          size={1}
          color={colors.mutedForeground}
        />
        <Text style={styles.emptyDateText}>No shifts scheduled</Text>
      </View>
    );
  }

  const normalContent = () => {
    return (
      <TouchableOpacity
        style={[styles.containerCard /* , isFirst && styles.firstShiftCard */]}
        onPress={() => buttonPressed()}
        onLongPress={() => itemPressed()}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.shiftHeader}>
            <View style={styles.timeContainer}>
              <Text style={styles.shiftTime}>
                {formatTime(item.start_time)}
              </Text>
              <Text style={styles.shiftTime}>{endTime}</Text>
            </View>

            <View style={styles.shiftInfo}>
              <Text style={styles.patientName}>{getfullName()}</Text>
              <Text style={styles.patientDni}>
                DNI: {item.patient ? item.patient.dni : "Unknown"}
              </Text>
            </View>

            <View style={styles.statusContainer}>
              <Ionicons
                name={statusIcon as any}
                size={20}
                color={statusColor}
              />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const flippedContent = () => {
    return (
      // <Animated.View
      //   style={[
      //     styles.flippedCardBorder,
      //     borderAnimatedStyle,
      //   ]}
      // >
      <TouchableOpacity
        style={[styles.flippedContainerCard]}
        onPress={() => buttonPressed()}
        onLongPress={() => itemPressed()}
        activeOpacity={0.7}
      >
        <Animated.View style={[styles.flippedCardContent, borderAnimatedStyle, backgroundAnimatedStyle]}>
          <View style={styles.shiftHeader}>
            <View style={styles.timeContainer}>
              <Text style={styles.shiftTime}>
                {formatTime(item.start_time)}
              </Text>
              <Text style={styles.shiftTime}>{endTime}</Text>
            </View>

            <View style={styles.shiftInfo}>
              <Text style={styles.patientName}>{getfullName()}</Text>
              <Text style={styles.patientDni}>
                DNI: {item.patient ? item.patient.dni : "Unknown"}
              </Text>
            </View>

            <View style={styles.statusContainer}>
              <Ionicons
                name={statusIcon as any}
                size={20}
                color={statusColor}
              />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
      // </Animated.View>
    );
  };

  return (
    <ThemedFlipCard
      frontContent={normalContent()}
      backContent={flippedContent()}
      isFlipped={isSelectMode}
    />
  );
};

export default React.memo(
  AgendaItem,
  (prev, next) =>
    prev.item.id === next.item.id &&
    prev.item.date === next.item.date &&
    prev.item.start_time === next.item.start_time &&
    prev.item.duration === next.item.duration &&
    prev.item.status === next.item.status &&
    prev.item.details === next.item.details &&
    prev.item.reason_incomplete === next.item.reason_incomplete &&
    prev.isSelectMode === next.isSelectMode &&
    prev.isSelected === next.isSelected
);
