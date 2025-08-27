import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import ThemedAccordion from "./ThemedAccordion";

interface SelectOption {
  label: string;
  value: any;
}

interface ThemedSelectProps {
  value: any;
  onValueChange: (value: any) => void;
  options: SelectOption[];
  placeholder?: string;
  hasError?: boolean;
  icon?: any;
  disabled?: boolean;
  maxDropdownHeight?: number;
}

const ThemedSelect = ({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  hasError,
  icon,
  disabled,
  maxDropdownHeight = 300,
}: ThemedSelectProps) => {
  const colors = useThemeColors();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const styles = StyleSheet.create({
    container: {
      position: "relative",
      flex: 1,
    },
    expandableContainer: {
      flex: 1,
      backgroundColor: colors.muted,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: hasError ? colors.destructive : colors.border,
    },
    selectButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 16,
    },
    selectButtonError: {
      borderColor: colors.destructive,
      backgroundColor: colors.destructiveMuted,
    },
    selectButtonDisabled: {
      opacity: 0.6,
    },
    text: {
      flex: 1,
      fontSize: 16,
      color: hasError ? colors.destructiveForeground : colors.foreground,
    },
    placeholder: {
      color: hasError ? colors.destructiveForeground : colors.mutedForeground,
    },
    modalContent: {
      backgroundColor: colors.background,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      overflow: "hidden",
      maxHeight: maxDropdownHeight,
    },
    scrollView: {
      maxHeight: maxDropdownHeight,
      backgroundColor: colors.muted,
      flexGrow: 1,
    },
    option: {
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.background,
      minHeight: 56,
    },
    optionLast: {
      borderBottomWidth: 0,
    },
    optionSelected: {
      backgroundColor: colors.primary + "20",
    },
    optionText: {
      fontSize: 16,
      color: colors.foreground,
      flex: 1,
      fontWeight: "400",
    },
    optionTextSelected: {
      color: colors.primary,
      fontWeight: "600",
    },
    checkIcon: {
      marginLeft: 12,
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyState: {
      paddingVertical: 40,
      paddingHorizontal: 20,
      alignItems: "center",
      backgroundColor: colors.background,
      minHeight: 120,
    },
    emptyIcon: {
      marginBottom: 12,
    },
    emptyText: {
      fontSize: 16,
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 24,
    },
    searchWrapper: {
      borderBottomWidth: 1,
      borderColor: colors.border,
      padding: 10,
      backgroundColor: colors.background,
    },
    searchInput: {
      backgroundColor: colors.muted,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
      color: colors.foreground,
    },
  });

  // Animation values
  const shakeX = useSharedValue(0);
  const scaleValue = useSharedValue(1);
  const chevronRotation = useSharedValue(0);
  const isAccordionOpen = useSharedValue(false);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  // Animation functions
  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(-2, { duration: 50 }),
      withTiming(2, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const openModal = () => {
    setSearchTerm("");
    isAccordionOpen.value = true;
    chevronRotation.value = withSpring(180, { damping: 12, stiffness: 200 });
  };

  const closeModal = () => {
    chevronRotation.value = withSpring(0, { damping: 12, stiffness: 200 });
    isAccordionOpen.value = false;
  };

  const handlePress = () => {
    if (disabled) return;

    scaleValue.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    if (!isAccordionOpen.value) openModal();
    else closeModal();
  };

  const handleOptionSelect = (optionValue: any) => {
    onValueChange(optionValue);
    closeModal();
  };

  useEffect(() => {
    if (hasError) {
      triggerShake();
    }
  }, [hasError]);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <>
      <Animated.View style={[styles.container, containerAnimatedStyle]}>
        <View style={styles.expandableContainer}>
          <TouchableOpacity
            onPress={handlePress}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[
                styles.selectButton,
                hasError && styles.selectButtonError,
                disabled && styles.selectButtonDisabled,
              ]}
            >
              {icon && (
                <Ionicons
                  name={icon}
                  size={20}
                  color={
                    hasError
                      ? colors.destructiveForeground
                      : colors.mutedForeground
                  }
                />
              )}
              <Text
                style={[styles.text, !selectedOption && styles.placeholder]}
              >
                {selectedOption ? selectedOption.label : placeholder}
              </Text>
              <Animated.View style={chevronAnimatedStyle}>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={
                    hasError
                      ? colors.destructiveForeground
                      : colors.mutedForeground
                  }
                />
              </Animated.View>
            </Animated.View>
          </TouchableOpacity>
          <ThemedAccordion isExpanded={isAccordionOpen} viewKey={1}>
            <View style={styles.modalContent}>
              <View style={styles.searchWrapper}>
                <TextInput
                  placeholder="Search..."
                  placeholderTextColor={colors.mutedForeground}
                  style={styles.searchInput}
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
              </View>
              {filteredOptions.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <Ionicons
                      name="list-outline"
                      size={48}
                      color={colors.mutedForeground}
                    />
                  </View>
                  <Text style={styles.emptyText}>No options available</Text>
                </View>
              ) : (
                <ScrollView
                  style={styles.scrollView}
                  showsVerticalScrollIndicator={true}
                  bounces={false}
                  nestedScrollEnabled={true}
                >
                  {filteredOptions.map((option, index) => (
                    <TouchableOpacity
                      key={`${option.value}-${index}`}
                      style={[
                        styles.option,
                        index === filteredOptions.length - 1 &&
                          styles.optionLast,
                        option.value === value && styles.optionSelected,
                      ]}
                      onPress={() => handleOptionSelect(option.value)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          option.value === value && styles.optionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                      <View style={styles.checkIcon}>
                        {option.value === value && (
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color={colors.primary}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </ThemedAccordion>
        </View>
      </Animated.View>
    </>
  );
};

export default ThemedSelect;
