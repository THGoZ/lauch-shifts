import { useThemeColors } from "@/hooks/useThemeColors";
import React, { useRef } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  measure,
  runOnUI,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  useAnimatedRef,
} from "react-native-reanimated";

interface ThemedAccordionProps {
  children: React.ReactNode;
  isExpanded: SharedValue<boolean>;
  style?: any;
  viewKey: number;
  duration?: number;
}

const ThemedAccordion = ({
  isExpanded,
  children,
  style,
  viewKey,
  duration = 300,
}: ThemedAccordionProps) => {
  const wrapperRef = useAnimatedRef<View>();

  const styles = StyleSheet.create({
    wrapper: {
      width: "100%",
      position: "absolute",
      display: "flex",
    },
    animatedView: {
      width: "100%",
      overflow: "hidden",
    },
  });

  const contentHeight = useSharedValue(0);

  const derivedHeight = useDerivedValue(() =>
    withTiming(isExpanded.value ? contentHeight.value : 0, {
      duration,
    })
  );

  const animatedStyle = useAnimatedStyle(() => ({
    height: derivedHeight.value,
  }));

  const onLayoutReady = () => {
    if (wrapperRef.current) {
      runOnUI(() => {
        const measured = measure(wrapperRef);
        if (measured) {
          contentHeight.value = measured.height;
        }
      })();
    }
  };

  return (
    <Animated.View
      key={`accordionItem_${viewKey}`}
      style={[styles.animatedView, animatedStyle, style]}
    >
      <View
        ref={wrapperRef}
        onLayout={onLayoutReady}
        style={styles.wrapper}
        collapsable={false} // ensure `ref` works
      >
        {children}
      </View>
    </Animated.View>
  );
};

export default ThemedAccordion;
