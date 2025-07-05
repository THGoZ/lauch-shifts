import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface ThemedTextInputProps extends TextInputProps {
  hasError?: boolean;
  icon?: any;
}

const ThemedTextInput = ({
  hasError,
  icon,
  ...props
}: ThemedTextInputProps) => {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    textInput: {
      flex: 1,
      fontSize: 16,
      color: hasError ? colors.destructiveForeground : colors.foreground,
    },
    inputContainer: {
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
    inputError: {
      borderColor: colors.destructive,
      backgroundColor: colors.destructiveMuted,
      color: colors.destructiveForeground,
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
      style={[styles.inputContainer, hasError && styles.inputError, animatedStyle]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={
            hasError ? colors.destructiveMutedForeground : colors.mutedForeground
          }
        />
      )}
      <TextInput
        style={styles.textInput}
        {...props}
        placeholderTextColor={
          hasError ? colors.destructiveMutedForeground : colors.mutedForeground
        }
      />
    </Animated.View>
  );
};

export default ThemedTextInput;
