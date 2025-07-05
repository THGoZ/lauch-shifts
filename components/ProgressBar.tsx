import { useThemeColors } from "@/hooks/useThemeColors";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

interface ProgressBarProps {
  totalItems: number;
  completedItems: number;
}

const ProgressBar = ({ totalItems, completedItems }: ProgressBarProps) => {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    progressContainer: {
      marginTop: 8,
      width: "100%",
    },
    progressBar: {
      height: 4,
      backgroundColor: colors.primaryForeground,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressText: {
      fontSize: 12,
      textAlign: "right",
      marginTop: 4,
    },
  });

  const progressWidth = useSharedValue(0);
  const progressColorValue = useSharedValue(0); // 0 = white, 1 = primary

  const [progress, setProgress] = useState(0);

  const calculateProgress = () => {
    const total = totalItems || 1; // avoid division by 0
    const completed = completedItems;
    return (completed / total) * 100;
  };

  useEffect(() => {
    const value = calculateProgress();
    setProgress(value);
    progressWidth.value = withSpring(value, { damping: 20, stiffness: 100 });

    // animate to 1 if 100%, else to 0 (white)
    progressColorValue.value = withSpring(value >= 100 ? 1 : 0, {
      damping: 20,
      stiffness: 100,
    });
  }, [totalItems, completedItems]);

  const progressAnimatedStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      progressColorValue.value,
      [0, 1],
      [colors.secondary, colors.primary] // white -> primary
    );

    return {
      width: `${progressWidth.value}%`,
      backgroundColor: bgColor,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const textColor = interpolateColor(
      progressColorValue.value,
      [0, 1],
      [colors.primary, colors.mutedForeground] // white -> mutedForeground
    );

    return {
      color: textColor,
    };
  });

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <Animated.View style={[StyleSheet.absoluteFill, progressAnimatedStyle]} />
      </View>
      <Animated.Text style={[styles.progressText, textAnimatedStyle]}>
        {Math.round(progress)}% Complete
      </Animated.Text>
    </View>
  );
};

export default ProgressBar;
