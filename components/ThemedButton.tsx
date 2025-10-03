"use client";

import React from "react";

import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

// Button variant types
export type ButtonVariant =
  | "primary"
  | "primaryOutline"
  | "secondary"
  | "secondaryOutline"
  | "outline"
  | "ghost"
  | "destructive"
  | "destructiveOutline"
  | "success"
  | "successOutline"
  | "warning"
  | "warningOutline";

// Button size types
export type ButtonSize = "small" | "medium" | "large";

// Button props interface
export interface ThemedButtonProps
  extends Omit<React.ComponentProps<typeof TouchableOpacity>, "style"> {
  // Content
  title: string;
  subtitle?: string;

  // Appearance
  variant?: ButtonVariant;
  size?: ButtonSize;

  // Icons
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  iconOnly?: boolean;

  // States
  loading?: boolean;
  disabled?: boolean;

  // Styling
  style?: ViewStyle;
  textStyle?: TextStyle;

  // Layout
  fullWidth?: boolean;
  rounded?: boolean;
}

const AnimatedText = Animated.createAnimatedComponent(Text);

const ThemedButton = ({
  title,
  subtitle,
  variant = "primary",
  size = "medium",
  leftIcon,
  rightIcon,
  iconOnly = false,
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
  rounded = false,
  onPress,
  ref,
  ...props
}: ThemedButtonProps) => {
  const colors = useThemeColors();

  // Animation values
  const opacity = useSharedValue(1);
  const backgroundColorProgress = useSharedValue(0);
  const scale = useSharedValue(1);

  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          textColor: colors.primaryForeground,
          pressedBackgroundColor: colors.primaryForeground,
          pressedTextColor: colors.primary,
          shadowColor: colors.primary,
        };
      case "primaryOutline":
        return {
          backgroundColor: "transparent",
          borderColor: colors.primary,
          textColor: colors.primary,
          pressedBackgroundColor: colors.primary + "20", // light overlay
          pressedTextColor: colors.primary,
          shadowColor: "transparent",
        };
      case "secondary":
        return {
          backgroundColor: colors.secondary,
          borderColor: colors.secondary,
          textColor: colors.secondaryForeground,
          pressedBackgroundColor: colors.secondaryForeground,
          pressedTextColor: colors.secondary,
          shadowColor: colors.secondary,
        };
      case "secondaryOutline":
        return {
          backgroundColor: "transparent",
          borderColor: colors.secondary,
          textColor: colors.secondary,
          pressedBackgroundColor: colors.secondary + "20",
          pressedTextColor: colors.secondary,
          shadowColor: "transparent",
        };
      case "destructive":
        return {
          backgroundColor: colors.destructive,
          borderColor: colors.destructive,
          textColor: colors.destructiveForeground,
          pressedBackgroundColor: colors.destructiveForeground,
          pressedTextColor: colors.destructive,
          shadowColor: colors.destructive,
        };
      case "destructiveOutline":
        return {
          backgroundColor: "transparent",
          borderColor: colors.destructive,
          textColor: colors.destructive,
          pressedBackgroundColor: colors.destructive + "20",
          pressedTextColor: colors.destructive,
          shadowColor: "transparent",
        };
      case "success":
        return {
          backgroundColor: colors.success,
          borderColor: colors.success,
          textColor: colors.successForeground,
          pressedBackgroundColor: colors.successForeground,
          pressedTextColor: colors.success,
          shadowColor: colors.success,
        };
      case "successOutline":
        return {
          backgroundColor: "transparent",
          borderColor: colors.success,
          textColor: colors.success,
          pressedBackgroundColor: colors.success + "20",
          pressedTextColor: colors.success,
          shadowColor: "transparent",
        };
      case "warning":
        return {
          backgroundColor: colors.warning,
          borderColor: colors.warningAccent,
          textColor: colors.warningForeground,
          pressedBackgroundColor: colors.warningForeground,
          pressedTextColor: colors.warning,
          shadowColor: colors.warning,
        };
      case "warningOutline":
        return {
          backgroundColor: "transparent",
          borderColor: colors.warning,
          textColor: colors.warning,
          pressedBackgroundColor: colors.warning + "20",
          pressedTextColor: colors.warning,
          shadowColor: "transparent",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: colors.border,
          textColor: colors.foreground,
          pressedBackgroundColor: colors.muted,
          pressedTextColor: colors.foreground,
          shadowColor: "transparent",
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderColor: "transparent",
          textColor: colors.accent,
          pressedBackgroundColor: colors.muted,
          pressedTextColor: colors.foreground,
          shadowColor: "transparent",
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          textColor: colors.primaryForeground,
          pressedBackgroundColor: colors.primaryForeground,
          pressedTextColor: colors.primary,
          shadowColor: colors.primary,
        };
    }
  };

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          paddingHorizontal: iconOnly ? 4 : 12,
          paddingVertical: iconOnly ? 6 : 8,
          fontSize: 14,
          iconSize: 18,
          minHeight: 32,
          borderRadius: rounded ? 16 : 8,
        };
      case "medium":
        return {
          paddingHorizontal: iconOnly ? 12 : 16,
          paddingVertical: 12,
          fontSize: 16,
          iconSize: 22,
          minHeight: 44,
          borderRadius: rounded ? 22 : 12,
        };
      case "large":
        return {
          paddingHorizontal: iconOnly ? 16 : 24,
          paddingVertical: 16,
          fontSize: 18,
          iconSize: 26,
          minHeight: 56,
          borderRadius: rounded ? 28 : 16,
        };
      default:
        return {
          paddingHorizontal: iconOnly ? 12 : 16,
          paddingVertical: 12,
          fontSize: 16,
          iconSize: 22,
          minHeight: 44,
          borderRadius: rounded ? 22 : 12,
        };
    }
  };

  const getGradientColors = (): [string, string] => {
    switch (variant) {
      case "primary":
        return [colors.primary, colors.accent];
      case "secondary":
        return [colors.secondary, colors.secondaryAccent];
      case "destructive":
        return [colors.destructive, colors.destructiveAccent];
      case "success":
        return [colors.success, colors.successAccent];
      case "warning":
        return [colors.warning, colors.warningAccent];
      case "primaryOutline":
      case "secondaryOutline":
      case "destructiveOutline":
      case "successOutline":
      case "warningOutline":
      case "outline":
      case "ghost":
        return [colors.background, colors.background];
      default:
        return [colors.primary, colors.accent];
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const animatedTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      backgroundColorProgress.value,
      [0, 1],
      [variantStyles.textColor, variantStyles.pressedTextColor]
    );

    return {
      color,
    };
  });

  const animatedViewStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
      backgroundColor: variantStyles.backgroundColor,
    };
  });

  const animateLoading = () => {
    if (loading) {
      opacity.value = withTiming(0.7, { duration: 200 });
    } else {
      opacity.value = withTiming(1, { duration: 200 });
    }
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = (e: any) => {
    onPress && onPress(e);
  };

  // Update loading animation
  React.useEffect(() => {
    animateLoading();
  }, [loading]);

  // Get current icon color
  const getCurrentIconColor = () => {
    return variantStyles.textColor;
  };

  // Create dynamic styles with proper text colors
  const dynamicStyles = StyleSheet.create({
    button: {
      borderColor: variantStyles.borderColor,
      borderWidth: 1,
      minHeight: sizeStyles.minHeight,
      borderRadius: sizeStyles.borderRadius,
      ...(fullWidth && { width: "100%" }),
      ...(iconOnly && {
        width: sizeStyles.minHeight,
        paddingHorizontal: 0,
      }),
      shadowColor: variantStyles.shadowColor,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    textContainer: {
      flex: iconOnly ? 0 : 1,
      alignItems: "center",
    },
    title: {
      fontSize: sizeStyles.fontSize,
      fontWeight: "600",
      color: variantStyles.textColor,
      textAlign: "center",
    },
    subtitle: {
      fontSize: sizeStyles.fontSize - 2,
      fontWeight: "400",
      color: variantStyles.textColor,
      opacity: 0.8,
      textAlign: "center",
      marginTop: 2,
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    loadingText: {
      fontSize: sizeStyles.fontSize,
      fontWeight: "600",
      color: variantStyles.textColor,
    },
    gradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: subtitle ? 8 : 6,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      paddingVertical: sizeStyles.paddingVertical,
      borderRadius: sizeStyles.borderRadius,
    },
  });

  // Render loading content
  const renderLoadingContent = () => (
    <View style={dynamicStyles.loadingContainer}>
      <ActivityIndicator size="small" color={variantStyles.textColor} />
      {!iconOnly && (
        <AnimatedText
          style={[dynamicStyles.loadingText, textStyle, animatedTextStyle]}
        >
          {title ?? "Loading"}
        </AnimatedText>
      )}
    </View>
  );

  // Render normal content
  const renderContent = () => (
    <>
      {leftIcon && (
        <View>
          <Ionicons
            name={leftIcon}
            size={sizeStyles.iconSize}
            color={getCurrentIconColor()}
          />
        </View>
      )}

      {!iconOnly && (
        <View>
          <AnimatedText
            style={[dynamicStyles.title, textStyle, animatedTextStyle]}
          >
            {title}
          </AnimatedText>
          {subtitle && (
            <AnimatedText style={[dynamicStyles.subtitle, animatedTextStyle]}>
              {subtitle}
            </AnimatedText>
          )}
        </View>
      )}

      {rightIcon && (
        <View>
          <Ionicons
            name={rightIcon}
            size={sizeStyles.iconSize}
            color={getCurrentIconColor()}
          />
        </View>
      )}
    </>
  );

  return (
    <Animated.View
      style={[animatedViewStyle, { borderRadius: sizeStyles.borderRadius }]}
    >
      <TouchableOpacity
        ref={ref}
        style={[
          dynamicStyles.button,
          disabled || loading ? dynamicStyles.buttonDisabled : {},
          style,
        ]}
        onPressIn={handlePressIn}
        onPress={(e) => handlePress(e)}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.4}
        {...props}
      >
        {!["outline", "ghost"].includes(variant) ? (
          <LinearGradient
            colors={getGradientColors()}
            style={dynamicStyles.gradient}
          >
            {loading ? renderLoadingContent() : renderContent()}
          </LinearGradient>
        ) : (
          <View style={dynamicStyles.gradient}>
            {loading ? renderLoadingContent() : renderContent()}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

ThemedButton.displayName = "ThemedButton";

export default ThemedButton;
