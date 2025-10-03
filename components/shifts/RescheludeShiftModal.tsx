import { useToast } from "@/context/ToastContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { getTransparentColor } from "@/utils/colorTools";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import ThemedBasicModal from "../ThemedBasicModal";
import ThemedButton from "../ThemedButton";
import ThemedLoading from "../ThemedLoading";

interface RescheludeShiftModalProps {
  rescheludeLoading: boolean;
  rescheduleShiftId?: number | null;
  isRescheduleModalVisible: boolean;
  onRescheduleClose: () => void;
}

const RescheludeShiftModal = ({
  rescheludeLoading,
  rescheduleShiftId,
  isRescheduleModalVisible,
  onRescheduleClose,
}: RescheludeShiftModalProps) => {
  const colors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        loadingContainer: {
          flex: 1,
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
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
  const {showToast} = useToast();

  const onReschedulePress = async () => {
    if (!rescheduleShiftId) {
      showToast(
        "error",
        "Error al reschedulear turno",
        "No se ha seleccionado un turno para reschedulear"
      );
      return;
    }
    router.push(
      `/shifts/create-single?id=${rescheduleShiftId}&isReprogramming=true`
    );
    onRescheduleClose();
  };

  if (rescheludeLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedLoading
          visible={true}
          type="bars"
          size="large"
          text="Loading shift details"
          overlay={true}
          overlayColor={getTransparentColor(colors.background, 0.5)}
        />
      </View>
    );
  }
  if (!rescheduleShiftId) {
    return null;
  }

  return (
    <ThemedBasicModal
      isOpen={isRescheduleModalVisible}
      onClose={() => onRescheduleClose()}
      title={`Reschedule shift N° ${rescheduleShiftId}`}
    >
      <View style={styles.rescheduleModalContent}>
        <Text style={styles.rescheduleText}>Reschedule this shift?</Text>
      </View>
      <View style={styles.separator} />
      <View style={styles.actionsContainer}>
        <ThemedButton
          onPress={onReschedulePress}
          title="Yes"
          variant="success"
          size="small"
          rounded={true}
          leftIcon="checkmark"
          loading={false}
        />
        <ThemedButton
          onPress={onRescheduleClose}
          title="No"
          variant="secondary"
          size="small"
          rounded={true}
          leftIcon="close-sharp"
          loading={false}
        />
      </View>
    </ThemedBasicModal>
  );
};

export default RescheludeShiftModal;
