import { shiftStatus } from "@/constants/enums";
import { useShifts } from "@/context/ShiftsContext";
import { useToast } from "@/context/ToastContext";
import { CustomError } from "@/domain/entities/error-entity";
import schema from "@/domain/validators/schema";
import { useThemeColors } from "@/hooks/useThemeColors";
import { FieldError, ShiftWithPatient } from "@/interfaces/interface";
import {
  durationAddition,
  formatDuration,
  formatTime,
} from "@/services/shifts/shift.helpers";
import { getTransparentColor } from "@/utils/colorTools";
import { Ionicons } from "@expo/vector-icons";
import { joiResolver } from "@hookform/resolvers/joi";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import ErrorDisplay from "../ErrorDisplay";
import ItemDetailsModal, { ModalActions } from "../ItemsDetailModal";
import ThemedCheckbox from "../ThemedCheckbox";
import ThemedLoading from "../ThemedLoading";
import ThemedTextArea from "../ThemedTextArea";

interface ShiftDetailsModalProps {
  detailsItem: ShiftWithPatient;
  isDetailsModalVisible: boolean;
  onDetailsClose: () => void;
  refreshShifts: () => Promise<void>;
  onDelete: (shiftId: number) => void;
  onReschedule: (shiftId: number) => void;
  isLoading?: boolean;
}

const ShiftDetailsModal = ({
  detailsItem,
  isDetailsModalVisible,
  onDetailsClose,
  onReschedule,
  onDelete,
  isLoading,
  refreshShifts,
}: ShiftDetailsModalProps) => {
  const colors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        extraDetailsContainer: {
          marginVertical: 5,
          maxHeight: 200,
          gap: 10,
          flexDirection: "row",
        },
        shiftDeatilsContainer: {
          flexGrow: 1,
          padding: 10,
          borderWidth: 1,
          borderRadius: 12,
          borderColor: colors.border,
          backgroundColor: getTransparentColor(colors.secondaryMuted, 0.5),
        },
        extraDetailsText: {
          fontSize: 14,
          color: colors.secondaryForeground,
        },
        editStatusForm: {
          justifyContent: "center",
          alignItems: "center",
          padding: 5,
          gap: 5,
        },
        formContainer: {
          marginVertical: 7,
          width: "100%",
        },
      }),
    [colors]
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setError,
    watch,
    reset: resetDetailsForm,
  } = useForm({
    resolver: joiResolver(schema.updateStatusSchema),
  });
  const status = watch("status");
  const { updateShift, isLoading: isUpdating } = useShifts();
  const { showToast } = useToast();

  useEffect(() => {
    if (!detailsItem) return;
    resetDetailsForm({
      status: detailsItem.status,
      reason_incomplete: detailsItem.reason_incomplete,
    });
  }, [detailsItem]);

  const onCloseDetailsModal = useCallback(async () => {
    resetDetailsForm();
    onDetailsClose();
    await refreshShifts();
  }, []);

  const onEditPress = useCallback(() => {
    if(detailsItem.status === shiftStatus.CANCELLED){
      router.push(`/shifts/create-single?id=${detailsItem.id}&isReprogramming=true`);
      return;
    }
    router.push(`/shifts/create-single?id=${detailsItem.id}`);
  }, [detailsItem]);

  const onDeletePress = useCallback(() => {
    onDelete(detailsItem.id);
  }, [detailsItem]);

  const onUpdateShift = async (data: any) => {
    try {
      const result = await updateShift(detailsItem?.id as number, {
        status: data.status,
        reason_incomplete: data.reason_incomplete,
      });

      if (!result.success) {
        showToast(
          "error",
          "An error ocurred while updating the shift",
          "Shift not updated"
        );
        if (result.error instanceof CustomError) {
          result.error.fields.forEach((fieldError: FieldError) => {
            setError(fieldError.field, {
              type: "manual",
              message: fieldError.message,
            });
          });
        } else {
          setError("general", {
            type: "manual",
            message: result.error.message,
          });
        }
      }
      showToast(
        "success",
        "Turno actualizado correctamente",
        "Turno actualizado"
      );
      await onCloseDetailsModal();
      if (
        status === shiftStatus.CANCELLED &&
        detailsItem?.status !== shiftStatus.CANCELLED
      ) {
        onReschedule(detailsItem?.id as number);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError("general", {
          type: "manual",
          message: error.message,
        });
        showToast("error", "Error al actualizar turno", error.message);
        return;
      }
      showToast("error", "Error al actualizar turno");
    }
  };

  const actions: ModalActions[] = [
    {
      label: "Save changes",
      icon: "checkmark-circle",
      onPress: handleSubmit((data) => onUpdateShift(data as any)),
      variant: "success",
      disabled: !isDirty || isUpdating,
      loading: isUpdating || isLoading,
    },
    {
      label: "Cancel",
      icon: "close-circle",
      onPress: onDetailsClose,
      variant: "secondary",
    },
  ];

  const renderExtraDetails = () => {
    if (detailsItem?.details === null) return null;
    return (
      <View style={styles.extraDetailsContainer}>
        <ScrollView style={styles.shiftDeatilsContainer}>
          <Text style={styles.extraDetailsText}>{detailsItem?.details}</Text>
        </ScrollView>
      </View>
    );
  };

  const renderEditStatusForm = () => {
    return (
      <View style={styles.editStatusForm}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Controller
            control={control}
            name="status"
            render={({ field: { onChange, value } }) => (
              <>
                <ThemedCheckbox
                  title="Confirmed"
                  variant="success"
                  leftIcon={
                    value === "confirmed" ? "checkmark-circle" : undefined
                  }
                  checked={value === "confirmed"}
                  onPress={() => onChange("confirmed")}
                />
              </>
            )}
          />
          <Controller
            control={control}
            name="status"
            render={({ field: { onChange, value } }) => (
              <>
                <ThemedCheckbox
                  title="Pending"
                  variant="warning"
                  leftIcon={
                    value === "pending" ? "checkmark-circle" : undefined
                  }
                  checked={value === "pending"}
                  onPress={() => onChange("pending")}
                />
              </>
            )}
          />
          <Controller
            control={control}
            name="status"
            render={({ field: { onChange, value } }) => (
              <>
                <ThemedCheckbox
                  title="Canceled"
                  variant="destructive"
                  leftIcon={
                    value === "canceled" ? "checkmark-circle" : undefined
                  }
                  checked={value === "canceled"}
                  onPress={() => onChange("canceled")}
                />
              </>
            )}
          />
        </View>
        {errors.status && (
          <ErrorDisplay message={errors.status.message as string} />
        )}
        {status === "canceled" && (
          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="reason_incomplete"
              render={({ field: { onChange, value } }) => (
                <ThemedTextArea
                  placeholder="Reason incomplete"
                  value={value}
                  onChangeText={onChange}
                  hasError={!!errors.reason_incomplete}
                />
              )}
            />
            {errors.reason_incomplete && (
              <ErrorDisplay
                message={errors.reason_incomplete.message as string}
              />
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <ItemDetailsModal
      metadata={[
        {
          label: "Patient",
          value: `${detailsItem.patient?.name} ${detailsItem.patient?.lastname}`,
          icon: (
            <Ionicons name="person-outline" size={16} color={colors.accent} />
          ),
        },
        {
          label: "DNI",
          value: detailsItem.patient?.dni,
          icon: (
            <Ionicons name="card-outline" size={16} color={colors.accent} />
          ),
        },
        {
          label: "Date",
          value: detailsItem.date,
          icon: (
            <Ionicons name="calendar-outline" size={16} color={colors.accent} />
          ),
        },
        {
          label: "Start Time",
          value: formatTime(detailsItem.start_time, false),
          icon: (
            <Ionicons name="time-outline" size={16} color={colors.accent} />
          ),
        },
        {
          label: "End Time",
          value: durationAddition(
            detailsItem.start_time,
            detailsItem.duration,
            true
          ),
          icon: (
            <Ionicons name="time-outline" size={16} color={colors.accent} />
          ),
        },
        {
          label: "Duration",
          value: formatDuration(detailsItem.duration),
          icon: (
            <Ionicons
              name="hourglass-outline"
              size={16}
              color={colors.accent}
            />
          ),
        },
        {
          label: "Reprogramed",
          value: detailsItem.reprogramed
            ? detailsItem.reprogramed === true
              ? "Yes"
              : "No"
            : "No",
          icon: (
            <Ionicons
              name="help-circle-outline"
              size={16}
              color={colors.accent}
            />
          ),
        },
      ]}
      isOpen={isDetailsModalVisible}
      onClose={() => onDetailsClose()}
      title={`Showing shift details`}
      subtitle={"Shift details:"}
      onEdit={onEditPress}
      onDelete={onDeletePress}
      actions={actions}
    >
      <View>
        {isLoading && <ThemedLoading visible={true} type="bars" size="large" />}
        {renderExtraDetails()}
        {renderEditStatusForm()}
      </View>
    </ItemDetailsModal>
  );
};

export default ShiftDetailsModal;
