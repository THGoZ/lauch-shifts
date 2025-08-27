import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import ThemedAccordion from "./ThemedAccordion";
import ThemedButton, { ButtonVariant } from "./ThemedButton";

type customAction = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant: ButtonVariant;
};

interface BulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  customActions?: customAction[];
}

export default function BulkActions({
  selectedCount,
  onBulkDelete,
  onClearSelection,
  customActions,
}: BulkActionsProps) {
  const colors = useThemeColors();
  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 8,
    },
    countContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 4,
    },
    countText: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontWeight: "500",
    },
    actionsContainer: {
      gap: 8,
      flexWrap: "wrap",
      alignContent: "center",
      justifyContent: "flex-start",
      flex: 1,
      flexDirection: "row",
    },
    actionButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.muted,
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primaryForeground,
    },
  });

  const isExpanded = useSharedValue(false);

  useEffect(() => {
    isExpanded.value = selectedCount > 0;
  }, [selectedCount]);

  return (
    <ThemedAccordion isExpanded={isExpanded} viewKey={1}>
      <View style={styles.container}>
        <View style={styles.countContainer}>
          <Text style={styles.countText}>{selectedCount}</Text>
          <Text style={styles.countText}>selected</Text>
        </View>
        <View style={styles.actionsContainer}>
          {customActions?.map((action) => (
            <ThemedButton
              key={action.label}
              title={action.label}
              leftIcon={action.icon}
              variant={action.variant}
              onPress={action.onPress}
            />
          ))}
          <ThemedButton
            title="Delete"
            leftIcon="trash-outline"
            variant="destructive"
            onPress={onBulkDelete}
          />
          <ThemedButton
            title="Clear"
            leftIcon="close-circle"
            variant="secondary"
            onPress={onClearSelection}
          />
        </View>
      </View>
    </ThemedAccordion>
  );
}
