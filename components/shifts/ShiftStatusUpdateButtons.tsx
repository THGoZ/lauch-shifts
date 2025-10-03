import { useThemeColors } from '@/hooks/useThemeColors';
import React, { useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import ErrorDisplay from '../ErrorDisplay';
import ThemedCheckbox from '../ThemedCheckbox';
import ThemedTextArea from '../ThemedTextArea';


interface ShiftStatusUpdateButtonsProps {
    errors: any;
    control : any;
}

const ShiftStatusUpdateButtons = ({errors, control}: ShiftStatusUpdateButtonsProps) => {

    const colors = useThemeColors();
    const styles = useMemo(
      () =>
        StyleSheet.create({
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
}

export default ShiftStatusUpdateButtons