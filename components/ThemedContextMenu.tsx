import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import ThemedButton, { ButtonVariant } from "./ThemedButton";

interface ItemAction {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: ButtonVariant;
}

interface ThemedContextMenuProps {
  isExpanded: SharedValue<boolean>;
  itemActions: ItemAction[];
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 120,
  mass: 1,
  overshootClamping: true,
};

const OFFSET = 50;

const ThemedContextMenu = ({
  isExpanded,
  itemActions,
}: ThemedContextMenuProps) => {
  const colors = useThemeColors();
  const styles = StyleSheet.create({
    buttonsContainer: {
      backgroundColor: colors.muted,
      height: 110,
      borderWidth: 1,
      borderColor: colors.border,
      position: "absolute",
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
      overflow: "hidden",
    },
    shadow: {
      shadowColor: colors.secondaryForeground,
      shadowOffset: { width: -0.5, height: 3.5 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
  });

  const animatedStyles = useAnimatedStyle(() => {
    const move = isExpanded.value ? OFFSET * 2 : OFFSET;
    const translateX = withSpring(-move, SPRING_CONFIG);

    const scale = withTiming(isExpanded.value ? 1 : 0);

    return {
      transform: [{ translateX }, { scale }],
    };
  });

  return (
    <Animated.View
      style={[styles.buttonsContainer, styles.shadow, animatedStyles]}
    >
      <ScrollView nestedScrollEnabled={true} style={{ padding: 10 }}>
        {itemActions.map((actions, index) => (
          <View key={index} style={{ margin: 5 }}>
            <ThemedButton
              title={actions.label}
              leftIcon={actions.icon}
              variant={actions.variant}
              size="small"
              onPress={() => {
                actions.onPress();
                isExpanded.value = false;
              }}
            />
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

export default ThemedContextMenu;
