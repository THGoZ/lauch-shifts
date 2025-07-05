"use client";

import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, TextInput, TouchableOpacity } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";

interface ThemedNumberInputProps {
  value: number | null;
  onValueChange: (value: number | null) => void;
  placeholder?: string;
  hasError?: boolean;
  icon?: any;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  showControls?: boolean;
}

const ThemedNumberInput = ({
  value,
  onValueChange,
  placeholder,
  hasError,
  icon,
  disabled,
  min,
  max,
  step = 1,
  showControls = true,
}: ThemedNumberInputProps) => {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.muted,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    containerError: {
      borderColor: colors.destructive,
      backgroundColor: colors.destructiveMuted,
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      color: hasError ? colors.destructiveForeground : colors.foreground,
      textAlign: "center",
    },
    controls: {
      flexDirection: "row",
      gap: 8,
    },
    controlButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    controlButtonDisabled: {
      backgroundColor: colors.border,
      opacity: 0.5,
    },
  });

  const shakeX = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

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

  const animateButton = () => {
    buttonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
  };

  const handleTextChange = (text: string) => {
    if (text === "") {
      onValueChange(null);
      return;
    }

    const numValue = Number.parseFloat(text);
    if (!isNaN(numValue)) {
      let finalValue = numValue;
      if (min !== undefined && finalValue < min) finalValue = min;
      if (max !== undefined && finalValue > max) finalValue = max;
      onValueChange(finalValue);
    }
  };

  const handleIncrement = () => {
    animateButton();
    const currentValue = value || 0;
    const newValue = currentValue + step;
    if (max === undefined || newValue <= max) {
      onValueChange(newValue);
    }
  };

  const handleDecrement = () => {
    animateButton();
    const currentValue = value || 0;
    const newValue = currentValue - step;
    if (min === undefined || newValue >= min) {
      onValueChange(newValue);
    }
  };

  useEffect(() => {
    if (hasError) {
      triggerShake();
    }
  }, [hasError]);

  const canIncrement = max === undefined || (value || 0) < max;
  const canDecrement = min === undefined || (value || 0) > min;

  return (
    <Animated.View
      style={[
        styles.container,
        hasError && styles.containerError,
        animatedStyle,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={
            hasError ? colors.destructiveForeground : colors.mutedForeground
          }
        />
      )}

      {showControls && (
        <Animated.View style={buttonAnimatedStyle}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              (!canDecrement || disabled) && styles.controlButtonDisabled,
            ]}
            onPress={handleDecrement}
            disabled={!canDecrement || disabled}
          >
            <Ionicons
              name="remove"
              size={16}
              color={colors.primaryForeground}
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      <TextInput
        style={styles.textInput}
        value={value?.toString() || ""}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor={
          hasError ? colors.destructiveForeground : colors.mutedForeground
        }
        keyboardType="numeric"
        editable={!disabled}
      />

      {showControls && (
        <Animated.View style={buttonAnimatedStyle}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              (!canIncrement || disabled) && styles.controlButtonDisabled,
            ]}
            onPress={handleIncrement}
            disabled={!canIncrement || disabled}
          >
            <Ionicons name="add" size={16} color={colors.primaryForeground} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
};

export default ThemedNumberInput;
