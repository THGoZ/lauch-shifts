import { shiftStatus } from "@/constants/enums";
import { useShifts } from "@/context/ShiftsContext";
import { useToast } from "@/context/ToastContext";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import BulkActions, { customBulkAction } from "../BulkActions";
import ThemedLoading from "../ThemedLoading";
import BulkActionConfirmModal from "./BulkActionConfirmModal";

interface ShiftsBulkActionsProps {
  selectedShiftsCount: number;
  selectedShifts: string[];
  onClearSelection: () => void;
  onOperationComplete: () => void;
}

const ShiftsBulkActions = ({
  selectedShiftsCount,
  onClearSelection,
  selectedShifts,
  onOperationComplete,
}: ShiftsBulkActionsProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] =
    useState<boolean>(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] =
    useState<boolean>(false);
  const [isCancelModalVisible, setIsCancelModalVisible] =
    useState<boolean>(false);
  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 1,
    },
  });

  const { bulkUpdateShiftsStatus, bulkDeleteShifts } = useShifts();
  const { showToast } = useToast();
  const onBulkConfirmShifts = () => {
    setIsConfirmModalVisible(true);
  };

  const onConfirmShifts = async () => {
    setIsConfirmModalVisible(false);
    setIsLoading(true);
    const status = shiftStatus.CONFIRMED;
    const result = await bulkUpdateShiftsStatus(selectedShifts, status);
    if (!result.success) {
      showToast(
        "error",
        "An error ocurred while updating the shifts",
        result.error.message
      );
    } else {
      showToast(
        "success",
        "Shifts updated successfully",
        "Shifts updated successfully"
      );
    }
    setIsLoading(false);
    onClearSelection();
    onOperationComplete();
  };

  const onBulkCancelShifts = () => {
    setIsCancelModalVisible(true);
  };

  const onConfirmCancelShifts = async () => {
    setIsCancelModalVisible(false);
    setIsLoading(true);
    const status = shiftStatus.CANCELLED;
    const result = await bulkUpdateShiftsStatus(selectedShifts, status);
    if (!result.success) {
      showToast(
        "error",
        "An error ocurred while updating the shifts",
        result.error.message
      );
    } else {
      showToast(
        "success",
        "Shifts updated successfully",
        "Shifts updated successfully"
      );
    }
    setIsLoading(false);
    onClearSelection();
    onOperationComplete();
  };

  const onBulkDeleteShifts = async () => {
    setIsDeleteModalVisible(true);
  };

  const onDeleteConfirm = async () => {
    setIsDeleteModalVisible(false);
    setIsLoading(true);
    const result = await bulkDeleteShifts(selectedShifts);
    if (!result.success) {
      showToast(
        "error",
        "An error ocurred while deleting the shifts",
        result.error.message
      );
    } else {
      showToast(
        "success",
        "Shifts deleted successfully",
        "Shifts deleted successfully"
      );
    }
    setIsLoading(false);
    onClearSelection();
    onOperationComplete();
  };

  const shiftsActions: customBulkAction[] = [
    {
      label: "Confirm",
      icon: "checkmark",
      onPress: onBulkConfirmShifts,
      variant: "successOutline",
    },
    {
      label: "Cancel",
      icon: "close-sharp",
      onPress: onBulkCancelShifts,
      variant: "destructiveOutline",
    },
  ];

  return (
    <>
      {isLoading && (
        <View style={styles.modalContainer}>
          <ThemedLoading
            visible={true}
            type="bars"
            size="large"
            text="Altering selected shifts"
            overlay={true}
            overlayColor="rgba(0, 0, 0, 0.5)"
          />
        </View>
      )}
      <BulkActions
        selectedCount={selectedShiftsCount}
        onBulkDelete={onBulkDeleteShifts}
        onClearSelection={onClearSelection}
        customActions={shiftsActions}
      />
      <BulkActionConfirmModal
        title="Delete shifts"
        confirmText={`Are you sure you want to delete the ${selectedShiftsCount} selected shifts?`}
        isModalVisible={isDeleteModalVisible}
        onCloseModal={() => setIsDeleteModalVisible(false)}
        onConfirm={onDeleteConfirm}
      />
      <BulkActionConfirmModal
        title="Confirm shifts"
        confirmText={`Are you sure you want to confirm the ${selectedShiftsCount} selected shifts?`}
        isModalVisible={isConfirmModalVisible}
        onCloseModal={() => setIsConfirmModalVisible(false)}
        onConfirm={onConfirmShifts}
      />
      <BulkActionConfirmModal
        title="Cancel shifts"
        confirmText={`Are you sure you want to cancel the ${selectedShiftsCount} selected shifts?`}
        isModalVisible={isCancelModalVisible}
        onCloseModal={() => setIsCancelModalVisible(false)}
        onConfirm={onConfirmCancelShifts}
      />
    </>
  );
};

export default ShiftsBulkActions;
