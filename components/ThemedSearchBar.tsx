import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface Props {
  placeholder: string;
  value?: string;
  onPress?: () => void;
  onSearchTermChange?: (searchTerm: string) => void;
  onClear?: () => void;
  focus?: boolean;
  onEmpty?: () => void;
}

const ThemedSearchBar = ({
  placeholder,
  onPress,
  value = "",
  onSearchTermChange,
  onClear,
  focus,
  onEmpty,
}: Props) => {
  const colors = useThemeColors();
  const styles = StyleSheet.create({
    inputContainer: {
      flexDirection: "row",
      flexShrink: 1,
      alignItems: "center",
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 2,
    },
    input: {
      flex: 1,
      marginLeft: 8,
      fontSize: 18,
      color: colors.foreground,
    },
    clearBtnHitSlop: { top: 6, bottom: 6, left: 6, right: 6 },
  });

  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const bgColorProgress = useSharedValue(0);

  useEffect(() => {
    if (focus) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [focus]);

  useEffect(() => {
    bgColorProgress.value = withTiming(isFocused ? 1 : 0, { duration: 300 });
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      bgColorProgress.value,
      [0, 1],
      [colors.muted, colors.mutedAccent]
    );
    return { backgroundColor };
  });

  const handleTextChange = (text: string) => {
    if (!text.trim().length && onEmpty) onEmpty();
    onSearchTermChange?.(text);
  };

  const handleClear = () => {
    onSearchTermChange?.(""); // reset controlled value upstream
    onClear?.();
    inputRef.current?.clear(); // clear native text instantly
    inputRef.current?.focus();
  };

  const showClearButton = Boolean(value?.length);

  return (
    <Animated.View style={[styles.inputContainer, animatedStyle]}>
      <Ionicons name="search" size={24} color={colors.mutedForeground} />

      <TextInput
        ref={inputRef}
        className="flex-1 ml-2 text-lg"
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        value={value}
        onChangeText={handleTextChange}
        onPressIn={onPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          onClear?.();
        }}
      />

      {showClearButton && (
        <Pressable onPress={handleClear} hitSlop={styles.clearBtnHitSlop}>
          <Ionicons
            name="close-circle"
            size={22}
            color={colors.mutedForeground}
          />
        </Pressable>
      )}
    </Animated.View>
  );
};

export default ThemedSearchBar;
