import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import ThemedButton, { ButtonVariant } from "./ThemedButton";
import ThemedContextMenu from "./ThemedContextMenu";

interface ItemAction {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: ButtonVariant;
}

interface CrudItemProps {
  id: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
  inSelectionMode: boolean;
  setInSelectionMode: (value: boolean) => void;
  children: React.ReactNode;
  customActions?: ItemAction[];
  duration?: number;
}

export default function CrudItem({
  id,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onViewDetails,
  inSelectionMode,
  setInSelectionMode,
  children,
  customActions,
  duration = 300,
}: CrudItemProps) {
  const colors = useThemeColors();
  const flipped = useSharedValue(false);

  const defaultActions: ItemAction[] = [
    {
      label: "Edit",
      icon: "pencil",
      onPress: () => {
        onEdit();
      },
      variant: "primary",
    },
    {
      label: "Delete",
      icon: "trash-outline",
      onPress: () => {
        onDelete();
      },
      variant: "destructive",
    },
  ];

  const allActions = [...defaultActions, ...(customActions ?? [])];

  const styles = StyleSheet.create({
    card: {
      width: "100%",
      backfaceVisibility: "hidden",
    },
    regularCard: {
      position: "absolute",
      zIndex: inSelectionMode ? 1 : 2,
    },
    flippedCard: {
      zIndex: inSelectionMode ? 2 : 1,
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
      backgroundColor: colors.background,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "transparent",
      shadowColor: colors.foreground,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    buttonContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
    },
  });

  const selectionTransition = useSharedValue<boolean>(false);
  const isExpanded = useSharedValue(false);

  useEffect(() => {
    selectionTransition.value = isSelected;
  }, [isSelected]);

  useEffect(() => {
    flipped.value = inSelectionMode;
  }, [inSelectionMode]);

  const iconContainerAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(
      Number(selectionTransition.value),
      [0, 1],
      [0, 180]
    );
    const rotateValue = withTiming(`${spinValue}deg`, { duration });

    return {
      transform: [{ rotateY: rotateValue }],
    };
  });

  const flippedIconContainerAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(
      Number(selectionTransition.value),
      [0, 1],
      [180, 360]
    );
    const rotateValue = withTiming(`${spinValue}deg`, { duration });
    return {
      transform: [{ rotateY: rotateValue }],
    };
  });

  const borderAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      Number(selectionTransition.value),
      [0, 1],
      [colors.border, colors.accent]
    );
    const colorValue = withTiming(color, { duration });
    return {
      borderColor: colorValue,
    };
  });

  const regularCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(flipped.value), [0, 1], [0, 180]);
    const rotateValue = withTiming(`${spinValue}deg`, { duration });

    return {
      transform: [{ rotateY: rotateValue }],
    };
  });

  const flippedCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(Number(flipped.value), [0, 1], [180, 360]);
    const rotateValue = withTiming(`${spinValue}deg`, { duration });
    return {
      transform: [{ rotateY: rotateValue }],
    };
  });

  const onLongPress = () => {
    if (!inSelectionMode) {
      onSelect(id);
    }
    setInSelectionMode(!inSelectionMode);
  };

  const regularContent = () => {
    return (
      <TouchableOpacity
        onLongPress={onLongPress}
        onPress={onViewDetails}
        style={styles.containerCard}
      >
        <View style={{ flex: 1, flexGrow: 1, flexDirection: "row"}}>
          {children}
        </View>
        <View style={styles.buttonContainer}>
          <ThemedButton
            title="Open"
            onPress={() => (isExpanded.value = !isExpanded.value)}
            iconOnly={true}
            size="large"
            variant="ghost"
            rightIcon="ellipsis-vertical"
          />
          <ThemedContextMenu isExpanded={isExpanded} itemActions={allActions} />
        </View>
      </TouchableOpacity>
    );
  };

  const flippedContent = () => {
    return (
      <Animated.View
        style={[
          {
            borderWidth: 1,
            borderRadius: 16,
            marginBottom: 12,
            marginHorizontal: 16,
          },
          borderAnimatedStyle,
        ]}
      >
        <TouchableOpacity
          onLongPress={onLongPress}
          onPress={() => onSelect(id)}
          style={styles.flippedContainerCard}
        >
          <View style={{ flex: 1, flexGrow: 1, flexDirection: "row" }}>
            {children}
          </View>
          <View style={{ justifyContent: "center" }}>
            <Animated.View
              style={[
                {
                  flexShrink: 1,
                  zIndex: 1,
                  position: "absolute",
                  backfaceVisibility: "hidden",
                },
                iconContainerAnimatedStyle,
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={36}
                color={colors.muted}
              />
            </Animated.View>
            <Animated.View
              style={[
                {
                  flexShrink: 1,
                  zIndex: 2,
                  backfaceVisibility: "hidden",
                },
                flippedIconContainerAnimatedStyle,
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={36}
                color={colors.primary}
              />
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View>
      <Animated.View
        style={[styles.regularCard, regularCardAnimatedStyle, styles.card]}
      >
        {regularContent()}
      </Animated.View>
      <Animated.View
        style={[styles.flippedCard, flippedCardAnimatedStyle, styles.card]}
      >
        {flippedContent()}
      </Animated.View>
    </View>
  );
}
