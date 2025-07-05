import React, { useEffect, useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withTiming,
} from "react-native-reanimated";

interface MovableViewProps {
  visible?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const MovableView = ({
  visible = true,
  children,
  className = "",
}: MovableViewProps) => {
  const offset = useSharedValue<number>(0);
  const offsety = useSharedValue<number>(0);
  const [isMounted, setIsMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setIsMounted(true);
        opacity.value = withTiming(1, {
          duration: 200,
        });
      }, 100);
      return () => clearTimeout(timer);
    } else if (isMounted) {
      opacity.value = withTiming(0, {
        duration: 200,
      });
      scale.value = withTiming(0.8, {
        duration: 200,
      });
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsMounted(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  const pan = Gesture.Pan()
    .onChange((event) => {
      offset.value += event.changeX;
      offsety.value += event.changeY;
    })
    .onFinalize((event) => {
      offsety.value = withDecay({
        velocity: event.velocityY,
        deceleration: 0.97,
        velocityFactor: 0.5,
      });
      offset.value = withDecay({
        velocity: event.velocityX,
        deceleration: 0.97,
        velocityFactor: 0.5,
      });
    });

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }, { translateY: offsety.value }],
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!shouldRender) {
    return null;
  }

  return (
    <GestureDetector gesture={pan}>
      <Animated.View className={`${className}`} style={[animatedStyles, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

export default MovableView;
