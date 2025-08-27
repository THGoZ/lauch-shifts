import { useThemeColors } from "@/hooks/useThemeColors";
import { getTransparentColor } from "@/utils/colorTools";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export interface RadioOption {
  label: string;
  description?: string;
  value: any;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  thumbColor: string;
  iconOnly?: boolean;
}

export type RadioListSize = "small" | "medium" | "large";

interface ThemedRadioListProps {
  items: RadioOption[];
  selectedIndex: SharedValue<number>;
  onPress: (value: any) => void;
  duration?: number;
  fillColor?: string;
  style?: ViewStyle;
  size?: RadioListSize;
}

const ThemedRadioList = ({
  items,
  selectedIndex,
  onPress,
  duration = 400,
  fillColor,
  style,
  size = "medium",
}: ThemedRadioListProps) => {
  const colors = useThemeColors();

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          padding: 8,
          fontSize: 12,
          iconSize: 16,
          descriptionFontSize: 10,
        };
      case "medium":
        return {
          padding: 12,
          fontSize: 16,
          iconSize: 18,
          descriptionFontSize: 14,
        };
      case "large":
        return {
          padding: 20,
          fontSize: 18,
          iconSize: 20,
          descriptionFontSize: 16,
        };
      default:
        return {
          padding: 12,
          fontSize: 16,
          iconSize: 18,
          descriptionFontSize: 16,
        };
    }
  };
  const sizeStyles = getSizeStyles();

  const styles = StyleSheet.create({
    container: {
      position: "relative",
      flexDirection: "row",
      borderRadius: 16,
      backgroundColor: getTransparentColor(fillColor ?? colors.muted, 0.5),
      borderWidth: 1,
      borderColor: getTransparentColor(fillColor ?? colors.border, 0.4),
      overflow: "hidden",
      ...(style || {}),
    },
    thumb: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
    },
    button: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
      padding: sizeStyles.padding,
      gap: 6,
    },
    text: {
      fontSize: sizeStyles.fontSize,
      fontWeight: "600",
      color: colors.foreground,
    },
    description: {
      fontSize: sizeStyles.descriptionFontSize,
      color: colors.foreground,
    },
  });

  // Animation-specific shared values
  const containerWidth = useSharedValue(0);
  const animatedIndex = useSharedValue(0); // This tracks the animated position
  const fromIndex = useSharedValue(0); // Starting index for animations
  const toIndex = useSharedValue(0); // Target index for animations
  const animationProgress = useSharedValue(0); // 0 to 1 animation progress
  const isInitialized = useSharedValue(false);

  // Initialize component
  useEffect(() => {
    if (!isInitialized.value) {
      const currentIndex = selectedIndex.value;
      animatedIndex.value = currentIndex;
      fromIndex.value = currentIndex;
      toIndex.value = currentIndex;
      animationProgress.value = 1; // Start fully "animated" to current position
      isInitialized.value = true;
    }
  }, []);

  const thumbStyle = useAnimatedStyle(() => {
    const segmentWidth = containerWidth.value / items.length;

    // Interpolate position based on animation progress
    const translateX =
      fromIndex.value * segmentWidth +
      (toIndex.value - fromIndex.value) *
        segmentWidth *
        animationProgress.value;

    // Interpolate color based on animation progress
    const fromColor = items[fromIndex.value]?.thumbColor || items[0].thumbColor;
    const toColor = items[toIndex.value]?.thumbColor || items[0].thumbColor;

    const backgroundColor = interpolateColor(
      animationProgress.value,
      [0, 1],
      [fromColor, toColor]
    );

    return {
      backgroundColor,
      transform: [{ translateX }],
      width: segmentWidth,
    };
  });

  const handlePress = (index: number, value: any) => {
    if (selectedIndex.value === index || !isInitialized.value) return;

    fromIndex.value = selectedIndex.value;
    toIndex.value = index;

    // Start animation
    animationProgress.value = 0;
    animationProgress.value = withTiming(1, {
      duration,
      easing: Easing.out(Easing.cubic),
    });

    selectedIndex.value = index;
    onPress(value);
  };

  useEffect(() => {
    if (selectedIndex.value < 0) {
      fromIndex.value = 0;
      toIndex.value = selectedIndex.value;
      animationProgress.value = 0;
      animationProgress.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, []);

  const renderContent = (item: RadioOption) => {
    return (
      <>
        {item.leftIcon && (
          <Ionicons
            name={item.leftIcon}
            size={sizeStyles.iconSize}
            color={colors.foreground}
          />
        )}
        {!item.iconOnly && (
          <View style={{ gap: 10, alignItems: "center" }}>
            <Animated.Text style={[styles.text]}>{item.label}</Animated.Text>
            {item.description && (
              <Animated.Text style={[styles.description]}>
                {item.description}
              </Animated.Text>
            )}
          </View>
        )}
        {item.rightIcon && (
          <Ionicons
            name={item.rightIcon}
            size={sizeStyles.iconSize}
            color={colors.foreground}
          />
        )}
      </>
    );
  };

  return (
    <View
      style={[styles.container]}
      onLayout={(e) => {
        const width = e.nativeEvent.layout.width;
        containerWidth.value = width;

        // Initialize on first layout
        if (!isInitialized.value) {
          const currentIndex = selectedIndex.value;
          animatedIndex.value = currentIndex;
          fromIndex.value = currentIndex;
          toIndex.value = currentIndex;
          animationProgress.value = 1;
          isInitialized.value = true;
        }
      }}
    >
      <Animated.View
        style={[
          styles.thumb,
          {
            borderRadius: 8,
          },
          thumbStyle,
        ]}
      />
      {items.map((item, index) => (
        <Pressable
          key={index}
          style={styles.button}
          onPress={() => handlePress(index, item.value)}
        >
          {renderContent(item)}
        </Pressable>
      ))}
    </View>
  );
};

export default ThemedRadioList;
