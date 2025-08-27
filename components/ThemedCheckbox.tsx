import { useThemeColors } from "@/hooks/useThemeColors";
import { getTransparentColor } from "@/utils/colorTools";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import {
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "success"
  | "warning";

// Button size types
export type ButtonSize = "small" | "medium" | "large";

// Button props interface
export interface ThemedCheckboxProps
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
  checked?: boolean;
  disabled?: boolean;

  // Styling
  style?: ViewStyle;
  textStyle?: TextStyle;

  // Layout
  fullWidth?: boolean;
  rounded?: boolean;
}

const ThemedCheckbox = ({
  title,
  subtitle,
  variant = "primary",
  size = "medium",
  leftIcon,
  rightIcon,
  iconOnly = false,
  checked = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
  rounded = false,
  onPress,
  ref,
  ...props
}: ThemedCheckboxProps) => {
  const colors = useThemeColors();

  const backgroundColorProgress = useSharedValue(0);
  const scale = useSharedValue(1);

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: getTransparentColor(colors.primaryAccent, 0.5),
          borderColor: colors.primary,
          textColor: colors.accent,
          pressedBackgroundColor: colors.primaryForeground,
          pressedTextColor: colors.primaryAccent,
          shadowColor: colors.primary,
        };
      case "secondary":
        return {
          backgroundColor: getTransparentColor(colors.secondary, 0.5),
          borderColor: colors.secondary,
          textColor: colors.secondaryForeground,
          pressedBackgroundColor: colors.secondaryMuted,
          pressedTextColor: colors.secondary,
          shadowColor: colors.secondary,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: colors.primary,
          textColor: colors.muted,
          pressedBackgroundColor: "transparent",
          pressedTextColor: colors.primaryAccent,
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
      case "destructive":
        return {
          backgroundColor: getTransparentColor(colors.destructiveAccent, 0.5),
          borderColor: colors.destructive,
          textColor: colors.destructive,
          pressedBackgroundColor: colors.destructiveMuted,
          pressedTextColor: colors.destructive,
          shadowColor: colors.destructive,
        };
      case "success":
        return {
          backgroundColor: getTransparentColor(colors.success, 0.5),
          borderColor: colors.success,
          textColor: colors.success,
          pressedBackgroundColor: colors.secondaryMuted,
          pressedTextColor: colors.success,
          shadowColor: colors.success,
        };
      case "warning":
        return {
          backgroundColor: getTransparentColor(colors.warning, 0.5),
          borderColor: colors.warningAccent,
          textColor: colors.warning,
          pressedBackgroundColor: colors.warningMuted,
          pressedTextColor: colors.warning,
          shadowColor: colors.warning,
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          textColor: colors.primaryForeground,
          pressedBackgroundColor: colors.primaryForeground,
          pressedTextColor: colors.primary,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          paddingHorizontal: iconOnly ? 8 : 12,
          paddingVertical: 8,
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
    const backgroundColor = interpolateColor(
      backgroundColorProgress.value,
      [0, 1],
      [variantStyles.backgroundColor, variantStyles.pressedBackgroundColor]
    );
    return {
      transform: [{ scale: scale.value }],
      backgroundColor: backgroundColor,
    };
  });

  const animateChecked = () => {
    if (checked) {
      backgroundColorProgress.value = withTiming(0.7, { duration: 200 });
      scale.value = withSpring(0.9);
    } else {
      backgroundColorProgress.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1);
    }
  };

  const handlePress = (e: any) => {
    onPress && onPress(e);
  };

  // Update loading animation
  useEffect(() => {
    animateChecked();
  }, [checked]);

  // Get current icon color
  const getCurrentIconColor = () => {
    return variantStyles.textColor;
  };

  const dynamicStyles = StyleSheet.create({
    button: {
      borderColor: variantStyles.borderColor,
      borderWidth: 3,
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
    },
  });

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
          <Animated.Text
            style={[dynamicStyles.title, textStyle, animatedTextStyle]}
          >
            {title}
          </Animated.Text>
          {subtitle && (
            <Animated.Text style={[dynamicStyles.subtitle, animatedTextStyle]}>
              {subtitle}
            </Animated.Text>
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
          disabled ? dynamicStyles.buttonDisabled : {},
          style,
        ]}
        onPress={(e) => handlePress(e)}
        disabled={disabled}
        activeOpacity={0.4}
        {...props}
      >
        <View style={dynamicStyles.gradient}>{renderContent()}</View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ThemedCheckbox;
