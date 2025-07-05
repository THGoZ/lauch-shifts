import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";

interface ThemedSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  description?: string;
  hasError?: boolean;
  icon?: any;
  disabled?: boolean;
}

const ThemedSwitch = ({
  value,
  onValueChange,
  label,
  description,
  hasError,
  icon,
  disabled,
}: ThemedSwitchProps) => {
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
    leftContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    textContainer: {
      flex: 1,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: hasError ? colors.destructiveForeground : colors.foreground,
    },
    description: {
      fontSize: 14,
      color: hasError ? colors.destructiveForeground : colors.mutedForeground,
      marginTop: 2,
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

  const handleValueChange = (newValue: boolean) => {
    scaleValue.value = withSequence(
      withTiming(0.95, { duration: 100 }),
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
      <View style={styles.leftContent}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={
              hasError ? colors.destructiveForeground : colors.mutedForeground
            }
          />
        )}
        <View style={styles.textContainer}>
          {label && <Text style={styles.label}>{label}</Text>}
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
        trackColor={{
          false: colors.border,
          true: colors.primary,
        }}
        thumbColor={colors.background}
        ios_backgroundColor={colors.border}
      />
    </Animated.View>
  );
};

export default ThemedSwitch;
