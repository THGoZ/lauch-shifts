"use client"

import { useThemeColors } from "@/hooks/useThemeColors"
import React from "react"
import { Modal, StyleSheet, Text, View, type TextStyle, type ViewStyle } from "react-native"
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated"

export type LoadingType = "spinner" | "dots" | "pulse" | "bars" | "wave"
export type LoadingSize = "small" | "medium" | "large"

export interface ThemedLoadingProps {
  visible?: boolean
  type?: LoadingType
  size?: LoadingSize


  text?: string
  subtext?: string


  color?: string
  backgroundColor?: string


  overlay?: boolean
  overlayColor?: string
  overlayOpacity?: number

  style?: ViewStyle
  textStyle?: TextStyle
  subtextStyle?: TextStyle

  duration?: number
}

const ThemedLoading: React.FC<ThemedLoadingProps> = ({
  visible = true,
  type = "spinner",
  size = "medium",
  text,
  subtext,
  color,
  backgroundColor,
  overlay = false,
  overlayColor,
  overlayOpacity = 0.8,
  style,
  textStyle,
  subtextStyle,
  duration = 1000,
}) => {
  const colors = useThemeColors()

  const getSizeConfig = () => {
    switch (size) {
      case "small":
        return {
          containerSize: 40,
          elementSize: 6,
          fontSize: 14,
          subtextFontSize: 12,
          spacing: 8,
        }
      case "large":
        return {
          containerSize: 80,
          elementSize: 12,
          fontSize: 18,
          subtextFontSize: 16,
          spacing: 16,
        }
      default:
        return {
          containerSize: 60,
          elementSize: 8,
          fontSize: 16,
          subtextFontSize: 14,
          spacing: 12,
        }
    }
  }

  const sizeConfig = getSizeConfig()
  const loadingColor = color || colors.primary
  const bgColor = backgroundColor || (overlay ? overlayColor || `rgba(0, 0, 0, ${overlayOpacity})` : "transparent")

  const rotation = useSharedValue(0)
  const dot1Scale = useSharedValue(1)
  const dot2Scale = useSharedValue(1)
  const dot3Scale = useSharedValue(1)
  const pulseScale = useSharedValue(1)
  const bar1Height = useSharedValue(0.3)
  const bar2Height = useSharedValue(0.3)
  const bar3Height = useSharedValue(0.3)
  const bar4Height = useSharedValue(0.3)
  const waveOffset = useSharedValue(0)

  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
      gap: sizeConfig.spacing,
    },
    overlayContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: bgColor,
      zIndex: 9999,
    },
    loadingContainer: {
      width: sizeConfig.containerSize,
      height: sizeConfig.containerSize,
      alignItems: "center",
      justifyContent: "center",
    },
    spinner: {
      width: sizeConfig.containerSize,
      height: sizeConfig.containerSize,
      borderRadius: sizeConfig.containerSize / 2,
      borderWidth: 3,
      borderColor: colors.border,
      borderTopColor: loadingColor,
    },
    dotsContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: sizeConfig.elementSize,
    },
    dot: {
      width: sizeConfig.elementSize,
      height: sizeConfig.elementSize,
      borderRadius: sizeConfig.elementSize / 2,
      backgroundColor: loadingColor,
    },
    pulseCircle: {
      width: sizeConfig.containerSize,
      height: sizeConfig.containerSize,
      borderRadius: sizeConfig.containerSize / 2,
      backgroundColor: loadingColor,
      opacity: 0.6,
    },
    barsContainer: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 4,
      height: sizeConfig.containerSize,
    },
    bar: {
      width: sizeConfig.elementSize,
      backgroundColor: loadingColor,
      borderRadius: sizeConfig.elementSize / 2,
    },
    waveContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
    },
    waveDot: {
      width: sizeConfig.elementSize,
      height: sizeConfig.elementSize,
      borderRadius: sizeConfig.elementSize / 2,
      backgroundColor: loadingColor,
    },
    text: {
      fontSize: sizeConfig.fontSize,
      fontWeight: "600",
      color: colors.foreground,
      textAlign: "center",
    },
    subtext: {
      fontSize: sizeConfig.subtextFontSize,
      color: colors.mutedForeground,
      textAlign: "center",
      marginTop: 4,
    },
  })

  React.useEffect(() => {
    if (!visible) return

    rotation.value = withRepeat(withTiming(360, { duration }), -1, false)

    const dotDelay = duration / 6
    dot1Scale.value = withRepeat(
      withSequence(withTiming(1.5, { duration: dotDelay }), withTiming(1, { duration: dotDelay })),
      -1,
      false,
    )
    dot2Scale.value = withRepeat(
      withSequence(withDelay(dotDelay, withTiming(1.5, { duration: dotDelay })), withTiming(1, { duration: dotDelay })),
      -1,
      false,
    )
    dot3Scale.value = withRepeat(
      withSequence(
        withDelay(dotDelay * 2, withTiming(1.5, { duration: dotDelay })),
        withTiming(1, { duration: dotDelay }),
      ),
      -1,
      false,
    )

    pulseScale.value = withRepeat(
      withSequence(withTiming(1.2, { duration: duration / 2 }), withTiming(1, { duration: duration / 2 })),
      -1,
      false,
    )

    const barDuration = duration / 4
    bar1Height.value = withRepeat(
      withSequence(withTiming(1, { duration: barDuration }), withTiming(0.3, { duration: barDuration })),
      -1,
      false,
    )
    bar2Height.value = withRepeat(
      withSequence(
        withDelay(barDuration * 0.25, withTiming(1, { duration: barDuration })),
        withTiming(0.3, { duration: barDuration }),
      ),
      -1,
      false,
    )
    bar3Height.value = withRepeat(
      withSequence(
        withDelay(barDuration * 0.5, withTiming(1, { duration: barDuration })),
        withTiming(0.3, { duration: barDuration }),
      ),
      -1,
      false,
    )
    bar4Height.value = withRepeat(
      withSequence(
        withDelay(barDuration * 0.75, withTiming(1, { duration: barDuration })),
        withTiming(0.3, { duration: barDuration }),
      ),
      -1,
      false,
    )

    waveOffset.value = withRepeat(withTiming(1, { duration }), -1, false)
  }, [visible, duration])

  const spinnerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  const dot1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dot1Scale.value }],
  }))

  const dot2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dot2Scale.value }],
  }))

  const dot3AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dot3Scale.value }],
  }))

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: interpolate(pulseScale.value, [1, 1.2], [0.6, 0.2], Extrapolation.CLAMP),
  }))

  const bar1AnimatedStyle = useAnimatedStyle(() => ({
    height: sizeConfig.containerSize * bar1Height.value,
  }))

  const bar2AnimatedStyle = useAnimatedStyle(() => ({
    height: sizeConfig.containerSize * bar2Height.value,
  }))

  const bar3AnimatedStyle = useAnimatedStyle(() => ({
    height: sizeConfig.containerSize * bar3Height.value,
  }))

  const bar4AnimatedStyle = useAnimatedStyle(() => ({
    height: sizeConfig.containerSize * bar4Height.value,
  }))

  const waveDotAnimatedStyles = Array.from({ length: 5 }, (_, index) => {
    const delay = index * 0.1
    return {
      delay: delay,
      offset: waveOffset.value,
    }
  })

  const renderLoadingAnimation = () => {
    switch (type) {
      case "spinner":
        return (
          <View style={styles.loadingContainer}>
            <Animated.View style={[styles.spinner, spinnerAnimatedStyle]} />
          </View>
        )

      case "dots":
        return (
          <View style={styles.dotsContainer}>
            <Animated.View style={[styles.dot, dot1AnimatedStyle]} />
            <Animated.View style={[styles.dot, dot2AnimatedStyle]} />
            <Animated.View style={[styles.dot, dot3AnimatedStyle]} />
          </View>
        )

      case "pulse":
        return (
          <View style={styles.loadingContainer}>
            <Animated.View style={[styles.pulseCircle, pulseAnimatedStyle]} />
          </View>
        )

      case "bars":
        return (
          <View style={styles.barsContainer}>
            <Animated.View style={[styles.bar, bar1AnimatedStyle]} />
            <Animated.View style={[styles.bar, bar2AnimatedStyle]} />
            <Animated.View style={[styles.bar, bar3AnimatedStyle]} />
            <Animated.View style={[styles.bar, bar4AnimatedStyle]} />
          </View>
        )

      case "wave":
        return (
          <View style={styles.waveContainer}>
            {waveDotAnimatedStyles.map((style, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.waveDot,
                  {
                    transform: [
                      {
                        translateY: interpolate(
                          (style.offset + style.delay) % 1,
                          [0, 0.5, 1],
                          [0, -sizeConfig.elementSize * 2, 0],
                          Extrapolation.CLAMP,
                        ),
                      },
                    ],
                  },
                ]}
              >
                {/* Wave dot content */}
              </Animated.View>
            ))}
          </View>
        )

      default:
        return null
    }
  }

  const renderContent = () => (
    <View style={[styles.container, style]}>
      {renderLoadingAnimation()}
      {text && <Text style={[styles.text, textStyle]}>{text}</Text>}
      {subtext && <Text style={[styles.subtext, subtextStyle]}>{subtext}</Text>}
    </View>
  )

  if (!visible) return null

  if (overlay) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlayContainer}>{renderContent()}</View>
      </Modal>
    )
  }

  return renderContent()
}

export default ThemedLoading
