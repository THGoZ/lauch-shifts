import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export interface ErrorItem {
  id: string;
  title: string;
  message: string;
  type?: "error" | "warning" | "info";
  timestamp?: Date;
  field?: string;
  code?: string;
}

interface ErrorDisplayProps {
  title?: string;
  summary?: string;
  errors: ErrorItem[];
  type?: "error" | "warning" | "info";
  onDismiss?: () => void;
  onRetry?: () => void;
  collapsible?: boolean;
  maxHeight?: number;
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function ErrorDetails({
  title = "Something went wrong",
  summary,
  errors = [],
  type = "error",
  onDismiss,
  onRetry,
  collapsible = true,
  maxHeight = 300,
}: ErrorDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const colors = useThemeColors();

  const styles = StyleSheet.create({
    container: {
      marginVertical: 8,
    },
    errorCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
      borderLeftWidth: 4,
      shadowColor: colors.foreground,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      overflow: "hidden",
    },
    cardGradient: {
      padding: 16,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.foreground,
      marginBottom: 2,
    },
    summary: {
      fontSize: 14,
      color: colors.mutedForeground,
      marginBottom: 2,
    },
    errorCount: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontWeight: "500",
    },
    actionsContainer: {
      flexDirection: "row",
      marginTop: 16,
      gap: 8,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 6,
    },
    retryButton: {
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dismissButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: "500",
    },
    detailsContainer: {
      overflow: "hidden",
      backgroundColor: colors.muted,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
    },
    staticDetailsContainer: {
      backgroundColor: colors.muted,
      borderRadius: 12,
      marginTop: 8,
      padding: 16,
    },
    detailsScrollView: {
      flex: 1,
      padding: 16,
    },
    errorItem: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    errorItemHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    errorItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    errorItemTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.foreground,
      marginLeft: 8,
      flex: 1,
    },
    errorTimestamp: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "monospace",
    },
    errorItemMessage: {
      fontSize: 13,
      color: colors.mutedForeground,
      lineHeight: 18,
      marginBottom: 8,
    },
    errorItemMeta: {
      flexDirection: "row",
      gap: 16,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    metaLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.mutedForeground,
      marginRight: 4,
    },
    metaValue: {
      fontSize: 11,
      color: colors.foreground,
      fontFamily: "monospace",
      backgroundColor: colors.muted,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
  });

  const expandProgress = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  const getTypeConfig = () => {
    switch (type) {
      case "warning":
        return {
          backgroundColor: colors.warning,
          foregroundColor: colors.foreground,
          icon: "warning" as const,
          gradientColors: [colors.warning, "#f97316"],
        };
      case "info":
        return {
          backgroundColor: colors.primary,
          foregroundColor: colors.primaryForeground,
          icon: "information-circle" as const,
          gradientColors: [colors.primary, colors.accent],
        };
      default:
        return {
          backgroundColor: colors.destructive,
          foregroundColor: colors.destructiveForeground,
          icon: "alert-circle" as const,
          gradientColors: [colors.destructive, "#dc2626"],
        };
    }
  };

  const typeConfig = getTypeConfig();

  const toggleExpanded = () => {
    if (!collapsible) return;

    const newExpandedState = !isExpanded;

    // Update state on JS thread
    runOnJS(setIsExpanded)(newExpandedState);

    // Animate expansion
    expandProgress.value = withSpring(newExpandedState ? 1 : 0, {
      damping: 15,
      stiffness: 150,
      mass: 1,
    });

    // Add a subtle scale animation to the card
    cardScale.value = withTiming(0.98, { duration: 100 }, () => {
      cardScale.value = withSpring(1, { damping: 10, stiffness: 200 });
    });
  };

  const handleButtonPress = (callback?: () => void) => {
    if (!callback) return;

    // Animate button press
    buttonScale.value = withTiming(0.95, { duration: 100 }, () => {
      buttonScale.value = withSpring(1, { damping: 10, stiffness: 200 });
      runOnJS(callback)();
    });
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getErrorTypeIcon = (errorType: string) => {
    switch (errorType) {
      case "warning":
        return "warning-outline";
      case "info":
        return "information-circle-outline";
      default:
        return "close-circle-outline";
    }
  };

  const getErrorTypeColor = (errorType: string) => {
    switch (errorType) {
      case "warning":
        return colors.warning;
      case "info":
        return colors.primary;
      default:
        return colors.destructive;
    }
  };

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
    };
  });

  const chevronAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      expandProgress.value,
      [0, 1],
      [0, 180],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });

  const detailsAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      expandProgress.value,
      [0, 1],
      [0, maxHeight],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      expandProgress.value,
      [0, 0.5, 1],
      [0, 0, 1],
      Extrapolate.CLAMP
    );

    return {
      height,
      opacity,
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  // Error item animations
  const ErrorItemComponent = ({
    error,
    index,
  }: {
    error: ErrorItem;
    index: number;
  }) => {
    const itemOpacity = useSharedValue(0);
    const itemTranslateY = useSharedValue(20);

    React.useEffect(() => {
      const delay = index * 100; // Stagger animation
      itemOpacity.value = withTiming(1, { duration: 300 }, () => {
        itemTranslateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      });
    }, []);

    const itemAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity: itemOpacity.value,
        transform: [{ translateY: itemTranslateY.value }],
      };
    });

    return (
      <Animated.View style={[styles.errorItem, itemAnimatedStyle]}>
        <View style={styles.errorItemHeader}>
          <View style={styles.errorItemLeft}>
            <Ionicons
              name={getErrorTypeIcon(error.type || type)}
              size={16}
              color={getErrorTypeColor(error.type || type)}
            />
            <Text style={styles.errorItemTitle}>{error.title}</Text>
          </View>

          {error.timestamp && (
            <Text style={styles.errorTimestamp}>
              {formatTimestamp(error.timestamp)}
            </Text>
          )}
        </View>

        <Text style={styles.errorItemMessage}>{error.message}</Text>

        {(error.field || error.code) && (
          <View style={styles.errorItemMeta}>
            {error.field && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Field:</Text>
                <Text style={styles.metaValue}>{error.field}</Text>
              </View>
            )}
            {error.code && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Code:</Text>
                <Text style={styles.metaValue}>{error.code}</Text>
              </View>
            )}
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Main Error Card */}
      <Animated.View
        style={[
          styles.errorCard,
          { borderLeftColor: typeConfig.backgroundColor },
          cardAnimatedStyle,
        ]}
      >
        <LinearGradient
          colors={[
            `${typeConfig.backgroundColor}15`,
            `${typeConfig.backgroundColor}05`,
          ]}
          style={styles.cardGradient}
        >
          {/* Header */}
          <TouchableOpacity
            style={styles.header}
            onPress={toggleExpanded}
            disabled={!collapsible}
            activeOpacity={0.7}
          >
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: typeConfig.backgroundColor },
                ]}
              >
                <Ionicons
                  name={typeConfig.icon}
                  size={20}
                  color={typeConfig.foregroundColor}
                />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.title}>{title}</Text>
                {summary && <Text style={styles.summary}>{summary}</Text>}
                <Text style={styles.errorCount}>
                  {errors.length} error{errors.length !== 1 ? "s" : ""} found
                </Text>
              </View>
            </View>

            {collapsible && (
              <Animated.View style={chevronAnimatedStyle}>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={colors.mutedForeground}
                />
              </Animated.View>
            )}
          </TouchableOpacity>

          {/* Action Buttons */}
          {(onRetry || onDismiss) && (
            <View style={styles.actionsContainer}>
              {onRetry && (
                <AnimatedTouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.retryButton,
                    buttonAnimatedStyle,
                  ]}
                  onPress={() => handleButtonPress(onRetry)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="refresh"
                    size={16}
                    color={typeConfig.backgroundColor}
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      { color: typeConfig.backgroundColor },
                    ]}
                  >
                    Retry
                  </Text>
                </AnimatedTouchableOpacity>
              )}

              {onDismiss && (
                <AnimatedTouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.dismissButton,
                    buttonAnimatedStyle,
                  ]}
                  onPress={() => handleButtonPress(onDismiss)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="close"
                    size={16}
                    color={colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Dismiss
                  </Text>
                </AnimatedTouchableOpacity>
              )}
            </View>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Expandable Error Details */}
      {collapsible && (
        <Animated.View style={[styles.detailsContainer, detailsAnimatedStyle]}>
          <ScrollView
            style={styles.detailsScrollView}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {errors.map((error, index) => (
              <ErrorItemComponent
                key={error.id || index}
                error={error}
                index={index}
              />
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Non-collapsible Error List */}
      {!collapsible && errors.length > 0 && (
        <View style={styles.staticDetailsContainer}>
          <ScrollView
            style={[styles.detailsScrollView, { maxHeight }]}
            showsVerticalScrollIndicator={false}
          >
            {errors.map((error, index) => (
              <ErrorItemComponent
                key={error.id || index}
                error={error}
                index={index}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
