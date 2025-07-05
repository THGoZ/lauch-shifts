import React, { useEffect, useState, type ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface AnimatedViewProps extends ViewProps {
  children?: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  initialOpacity?: number;
  finalOpacity?: number;
  disabled?: boolean;
}

const AnimatedView = ({
  children,
  className = "",
  delay = 50,
  duration = 500,
  initialOpacity = 0,
  finalOpacity = 1,
  disabled = false,
  ...props
}: AnimatedViewProps) => {
  const [isVisible, setIsVisible] = useState(disabled);

  const opacity = useSharedValue(initialOpacity);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (disabled) {
      opacity.value = finalOpacity;
      translateY.value = 0;
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
      opacity.value = withTiming(finalOpacity, { duration });
      translateY.value = withTiming(0, { duration });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, disabled]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (disabled) {
    return (
      <View className={className} {...props}>
        {children}
      </View>
    );
  }

  return (
    <Animated.View style={animatedStyle} className={className} {...props}>
      {children}
    </Animated.View>
  );
};

export default AnimatedView;
