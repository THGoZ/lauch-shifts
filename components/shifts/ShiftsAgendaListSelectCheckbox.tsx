import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ShiftsAgendaListSelectCheckboxProps {
  selectedCount: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
  items: any[];
}

const ShiftsAgendaListSelectCheckbox = ({
  selectedCount,
  onClearSelection,
  onSelectAll,
  items,
}: ShiftsAgendaListSelectCheckboxProps) => {
  const colors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        selecItemsContainer: {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginHorizontal: 9,
          marginBottom: 5,
          marginTop: 9,
        },
        contentContainer: {
          flexDirection: "row", alignItems: "center", gap: 8
        },
        checkboxContainer: {
          width: 28,
          height: 28,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: colors.primary,
        },
        checkboxText: {
          fontSize: 16,
          color: colors.primary,
        },
      }),
    [colors]
  );

  return (
    <TouchableOpacity
      onPress={
        selectedCount === items.length && items.length > 0
          ? onClearSelection
          : onSelectAll
      }
      style={styles.selecItemsContainer}
    >
      <View style={styles.contentContainer}>
        <View style={styles.checkboxContainer}>
          {selectedCount === items.length && items.length > 0 && (
            <Ionicons name="checkmark" size={24} color={colors.primary} />
          )}
        </View>
        <Text style={styles.checkboxText}>
          {selectedCount === items.length && items.length > 0
            ? "Deselect all"
            : "Select all"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ShiftsAgendaListSelectCheckbox;
