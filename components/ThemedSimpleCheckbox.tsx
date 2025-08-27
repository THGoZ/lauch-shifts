import { useThemeColors } from "@/hooks/useThemeColors"
import { Ionicons } from "@expo/vector-icons"
import React from "react"
import { StyleSheet, Text, type TextStyle, TouchableOpacity, View, type ViewStyle } from "react-native"
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated"

export interface ThemedCheckboxProps {
  // Core functionality
  checked: boolean
  onCheckedChange: (checked: boolean) => void

  // Content
  label?: string

  // States
  disabled?: boolean
  hasError?: boolean

  // Styling
  style?: ViewStyle
  labelStyle?: TextStyle

  // Size
  size?: number
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

const ThemedCheckbox: React.FC<ThemedCheckboxProps> = ({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  hasError = false,
  style,
  labelStyle,
  size = 20,
}) => {
  const colors = useThemeColors()

  // Animation values
  const scale = useSharedValue(1)
  const checkScale = useSharedValue(checked ? 1 : 0)
  const backgroundColorProgress = useSharedValue(checked ? 1 : 0)
  const shakeX = useSharedValue(0)

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
    },
    containerDisabled: {
      opacity: 0.5,
    },
    checkbox: {
      width: size,
      height: size,
      borderRadius: 4,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      borderColor: hasError ? colors.destructive : colors.border,
    },
    label: {
      fontSize: 16,
      fontWeight: "500",
      color: hasError ? colors.destructive : colors.foreground,
      flex: 1,
    },
  })

  // Update animations when checked state changes
  React.useEffect(() => {
    if (checked) {
      checkScale.value = withSpring(1, { damping: 12, stiffness: 200 })
      backgroundColorProgress.value = withTiming(1, { duration: 200 })
    } else {
      checkScale.value = withTiming(0, { duration: 150 })
      backgroundColorProgress.value = withTiming(0, { duration: 200 })
    }
  }, [checked])

  // Shake animation for error
  React.useEffect(() => {
    if (hasError) {
      shakeX.value = withSequence(
        withTiming(-4, { duration: 50 }),
        withTiming(4, { duration: 50 }),
        withTiming(-3, { duration: 50 }),
        withTiming(3, { duration: 50 }),
        withTiming(-1, { duration: 50 }),
        withTiming(1, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      )
    }
  }, [hasError])


  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }))

  const checkboxAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(backgroundColorProgress.value, [0, 1], ["transparent", colors.primary])

    const borderColor = interpolateColor(
      backgroundColorProgress.value,
      [0, 1],
      [hasError ? colors.destructive : colors.border, colors.primary],
    )

    return {
      backgroundColor,
      borderColor,
      transform: [{ scale: scale.value }],
    }
  })

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    opacity: checkScale.value,
    transform: [{ scale: checkScale.value }],
  }))


  const handlePress = () => {
    if (disabled) return


    scale.value = withSequence(withTiming(0.9, { duration: 100 }), withSpring(1, { damping: 10, stiffness: 200 }))

    onCheckedChange(!checked)
  }

  return (
    <AnimatedTouchableOpacity
      style={[styles.container, disabled && styles.containerDisabled, containerAnimatedStyle, style]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.checkbox, checkboxAnimatedStyle]}>
        {checked && (
          <Animated.View style={checkAnimatedStyle}>
            <Ionicons name="checkmark" size={size * 0.7} color={colors.primaryForeground} />
          </Animated.View>
        )}
      </Animated.View>

      {label && (
        <>
          <View style={{ width: 8 }} />
          <Text style={[styles.label, labelStyle]}>{label}</Text>
        </>
      )}
    </AnimatedTouchableOpacity>
  )
}

export default ThemedCheckbox
