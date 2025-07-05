"use client";

import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, TextInput, type TextInputProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface ThemedTextAreaProps extends TextInputProps {
  hasError?: boolean;
  icon?: any;
  minHeight?: number;
}

const ThemedTextArea = ({
  hasError,
  icon,
  minHeight = 100,
  ...props
}: ThemedTextAreaProps) => {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    textInput: {
      flex: 1,
      fontSize: 16,
      color: hasError ? colors.destructiveForeground : colors.foreground,
      minHeight,
      textAlignVertical: "top",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: colors.muted,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputError: {
      borderColor: colors.destructive,
      backgroundColor: colors.destructiveMuted,
    },
    iconContainer: {
      paddingTop: 9,
    },
  });

  const shakeX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
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

  useEffect(() => {
    if (hasError) {
      triggerShake();
    }
  }, [hasError]);

  return (
    <Animated.View
      style={[
        styles.inputContainer,
        hasError && styles.inputError,
        animatedStyle,
      ]}
    >
      {icon && (
        <Animated.View style={styles.iconContainer}>
          <Ionicons
            name={icon}
            size={20}
            color={
              hasError ? colors.destructiveForeground : colors.mutedForeground
            }
          />
        </Animated.View>
      )}
      <TextInput
        style={styles.textInput}
        multiline
        {...props}
        placeholderTextColor={
          hasError ? colors.destructiveMutedForeground : colors.mutedForeground
        }
      />
    </Animated.View>
  );
};

export default ThemedTextArea;
