import { useToast } from "@/context/ToastContext";
import { useShiftsDb } from "@/hooks/useShiftsDb";
import { useThemeColors } from "@/hooks/useThemeColors";
import { getTransparentColor } from "@/utils/colorTools";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import DeleteModal from "../DeleteModal";
import ThemedLoading from "../ThemedLoading";

interface DeleteShiftModalProps {
  isDeleteShiftLoading: boolean;
  deleteShiftId?: number | null;
  isDeleteModalVisible: boolean;
  onDeleteClose: () => void;
  refreshShifts: () => Promise<void>;
}

const DeleteShiftModal = ({
  isDeleteShiftLoading,
  deleteShiftId,
  isDeleteModalVisible,
  onDeleteClose,
  refreshShifts,
}: DeleteShiftModalProps) => {
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
      }),
    [colors]
  );
  const { showToast } = useToast();
  const { deleteShift } = useShiftsDb();
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);
  const onDelete = async () => {
    setIsDeleting(true);
    if (!deleteShiftId) {
      showToast("error", "Error when deleting shift", "No shift selected");
      return;
    }
    const result = await deleteShift(deleteShiftId);
    if (!result.success) {
      showToast("error", "Error when deleting shift", result.error.message);
    } else {
      showToast("success", "Shift deleted successfully", "Shift deleted");
    }
    setIsDeleting(false);
    await refreshShifts();
    onDeleteClose();
  };

  if (isDeleteShiftLoading) {
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
  if (!deleteShiftId) {
    return null;
  }

  return (
    <DeleteModal
      onDelete={onDelete}
      onCancel={onDeleteClose}
      isVisible={isDeleteModalVisible}
      item={deleteShiftId}
      title="Delete shift"
      description="Are you sure you want to delete this shift?"
      itemName="Shift"
      isLoading={isDeleting}
    />
  );
};

export default DeleteShiftModal;
