import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import Slider from '@react-native-community/slider';
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";

interface ThemedSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  hasError?: boolean;
  icon?: any;
  disabled?: boolean;
  showValue?: boolean;
  label?: string;
}

const ThemedSlider = ({
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  hasError,
  icon,
  disabled,
  showValue = true,
  label,
}: ThemedSliderProps) => {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.muted,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    containerError: {
      borderColor: colors.destructive,
      backgroundColor: colors.destructiveMuted,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    leftHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: hasError ? colors.destructiveForeground : colors.foreground,
    },
    value: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary,
    },
    slider: {
      height: 40,
    },
    rangeContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 4,
    },
    rangeText: {
      fontSize: 12,
      color: hasError ? colors.destructiveForeground : colors.mutedForeground,
    },
  });

  const shakeX = useSharedValue(0);
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }, { scale: scaleValue.value }],
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

  const handleValueChange = (newValue: number) => {
    scaleValue.value = withSequence(
      withTiming(0.98, { duration: 50 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    onValueChange(newValue);
  };

  useEffect(() => {
    if (hasError) {
      triggerShake();
    }
  }, [hasError]);

  return (
    <Animated.View
      style={[
        styles.container,
        hasError && styles.containerError,
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={
                hasError ? colors.destructiveForeground : colors.mutedForeground
              }
            />
          )}
          {label && <Text style={styles.label}>{label}</Text>}
        </View>
        {showValue && <Text style={styles.value}>{value}</Text>}
      </View>

      <Slider
        style={styles.slider}
        value={value}
        onValueChange={handleValueChange}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        disabled={disabled}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
      />

      <View style={styles.rangeContainer}>
        <Text style={styles.rangeText}>{minimumValue}</Text>
        <Text style={styles.rangeText}>{maximumValue}</Text>
      </View>
    </Animated.View>
  );
};

export default ThemedSlider;
