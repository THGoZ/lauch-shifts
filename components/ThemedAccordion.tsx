import { useThemeColors } from "@/hooks/useThemeColors";
import { StyleSheet, View } from "react-native";
import Animated, {
    SharedValue,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withTiming,
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
  const colors = useThemeColors();
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
  const height = useSharedValue(0);

  const derivedHeight = useDerivedValue(() =>
    withTiming(height.value * Number(isExpanded.value), {
      duration,
    })
  );
  const bodyStyle = useAnimatedStyle(() => ({
    height: derivedHeight.value,
  }));

  return (
    <Animated.View
      key={`accordionItem_${viewKey}`}
      style={[styles.animatedView, bodyStyle, style]}
    >
      <View
        onLayout={(e) => {
          height.value = e.nativeEvent.layout.height;
        }}
        style={styles.wrapper}
      >
        {children}
      </View>
    </Animated.View>
  );
};

export default ThemedAccordion;
