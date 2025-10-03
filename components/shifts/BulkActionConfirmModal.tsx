import { useThemeColors } from "@/hooks/useThemeColors";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import ThemedBasicModal from "../ThemedBasicModal";
import ThemedButton from "../ThemedButton";

interface BulkActionConfirmModalProps {
  isModalVisible: boolean;
  title: string;
  confirmText: string;
  onCloseModal: () => void;
  onConfirm: () => void;
}

const BulkActionConfirmModal = ({
  isModalVisible,
  title,
  confirmText,
  onCloseModal,
  onConfirm,
}: BulkActionConfirmModalProps) => {
  const colors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        modalContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 1,
        },
        rescheduleModalContent: {
          justifyContent: "flex-start",
          alignItems: "flex-start",
          marginHorizontal: 20,
        },
        rescheduleText: {
          fontSize: 16,
          color: colors.mutedForeground,
        },
        separator: {
          height: 1,
          backgroundColor: colors.border,
          marginVertical: 5,
        },
        actionsContainer: {
          marginBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          alignContent: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 8,
        },
      }),
    [colors]
  );
  return (
    <View style={styles.modalContainer}>
      <ThemedBasicModal
        title={title}
        isOpen={isModalVisible}
        onClose={onCloseModal}
      >
        <View style={styles.rescheduleModalContent}>
          <Text style={styles.rescheduleText}>{confirmText}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.actionsContainer}>
          <ThemedButton
            onPress={onConfirm}
            title="Yes"
            variant="success"
            size="small"
            rounded={true}
            leftIcon="checkmark-done-sharp"
            loading={false}
          />
          <ThemedButton
            onPress={onCloseModal}
            title="No"
            variant="secondary"
            size="small"
            rounded={true}
            leftIcon="close-sharp"
            loading={false}
          />
        </View>
      </ThemedBasicModal>
    </View>
  );
};

export default BulkActionConfirmModal;
