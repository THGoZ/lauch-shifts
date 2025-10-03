import { useThemeColors } from "@/hooks/useThemeColors";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

interface ThemedFlipCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  // direction?: "horizontal" | "vertical";
  // trigger?: "tap" | "manual" | "hover";
  isFlipped: boolean;
  onFlip?: (isFlipped: boolean) => void;
  duration?: number;
}

const ThemedFlipCard = ({
  frontContent,
  backContent,
  isFlipped,
  onFlip,
  duration = 300,
}: ThemedFlipCardProps) => {
  const colors = useThemeColors();
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        card: {
          width: "100%",
          backfaceVisibility: "hidden",
        },
        regularCard: {
          position: "absolute",
          zIndex: isFlipped ? 1 : 2,
        },
        flippedCard: {
          zIndex: isFlipped ? 2 : 1,
        },
      }),
    [colors, isFlipped] // Added isFlipped to dependencies
  );

  const flippedTransition = useSharedValue(false);
  useEffect(() => {
    flippedTransition.value = isFlipped;
  }, [isFlipped]);

  const regularCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(
      Number(flippedTransition.value),
      [0, 1],
      [0, 180]
    );
    const rotateValue = withTiming(`${spinValue}deg`, { duration });

    return {
      transform: [{ rotateY: rotateValue }],
    };
  });

  const flippedCardAnimatedStyle = useAnimatedStyle(() => {
    const spinValue = interpolate(
      Number(flippedTransition.value),
      [0, 1],
      [180, 360]
    );
    const rotateValue = withTiming(`${spinValue}deg`, { duration });
    return {
      transform: [{ rotateY: rotateValue }],
    };
  });

  return (
    <View>
      <Animated.View
        style={[styles.regularCard, regularCardAnimatedStyle, styles.card]}
      >
        {frontContent}
      </Animated.View>
      <Animated.View
        style={[styles.flippedCard, flippedCardAnimatedStyle, styles.card]}
      >
        {backContent}
      </Animated.View>
    </View>
  );
};

export default ThemedFlipCard;
