import { CustomError } from "@/domain/entities/error-entity";
import { useThemeColors } from "@/hooks/useThemeColors";
import { joiResolver } from "@hookform/resolvers/joi";
import { LinearGradient } from "expo-linear-gradient";
import Joi from "joi";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import ProgressBar from "./ProgressBar";
import ThemedSwitch from "./ThemedSwitch";
import ThemedTextArea from "./ThemedTextArea";
import ThemedTextInput from "./ThemedTextInput";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export interface FieldConfig {
  key: string;
  label: string;
  icon?: string;
  type:
    | "text"
    | "number"
    | "password"
    | "textarea"
    | "boolean"
    | "select"
    | "date";
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  options?: { label: string; value: any }[];
  disabled?: boolean;
  description?: string;
}

interface ObjectEditorProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  data: any;
  fields: FieldConfig[];
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  showResetButton?: boolean;
  resetLabel?: string;
  validateOnChange?: boolean;
  showProgress?: boolean;
  maxWidth?: number;
  validationSchema: Joi.ObjectSchema;
  isLoading: boolean;
}

const ObjectEditor = ({
  title,
  subtitle,
  icon,
  data,
  fields,
  onSubmit,
  onCancel,
  submitLabel = "Save Changes",
  cancelLabel = "Cancel",
  showResetButton = true,
  resetLabel = "Reset",
  validateOnChange = true,
  showProgress = true,
  maxWidth = 600,
  validationSchema,
  isLoading,
}: ObjectEditorProps) => {
  const colors = useThemeColors();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      alignSelf: "center",
      width: "100%",
    },
    header: {
      marginBottom: 24,
      alignItems: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.foreground,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.mutedForeground,
      marginBottom: 16,
    },
    progressContainer: {
      marginTop: 8,
      width: "100%",
    },
    progressBar: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 2,
    },
    progressText: {
      fontSize: 12,
      color: colors.mutedForeground,
      textAlign: "right",
      marginTop: 4,
    },
    fieldsContainer: {
      gap: 20,
      marginBottom: 32,
    },
    fieldContainer: {
      gap: 8,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.foreground,
    },
    fieldDescription: {
      fontSize: 14,
      color: colors.mutedForeground,
      lineHeight: 20,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      position: "relative",
    },
    inputIcon: {
      position: "absolute",
      left: 12,
      zIndex: 1,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.foreground,
      backgroundColor: colors.background,
    },
    inputError: {
      borderColor: colors.destructive,
    },
    inputDisabled: {
      backgroundColor: colors.muted,
      color: colors.mutedForeground,
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: "top",
    },
    characterCount: {
      fontSize: 12,
      color: colors.mutedForeground,
      textAlign: "right",
    },
    errorText: {
      fontSize: 12,
      color: colors.destructive,
      marginTop: 4,
    },
    booleanField: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 8,
    },
    booleanLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: 12,
    },
    booleanText: {
      flex: 1,
    },
    selectContainer: {
      flexDirection: "row",
    },
    selectOption: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.muted,
      marginRight: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    selectOptionText: {
      fontSize: 14,
      color: colors.foreground,
      fontWeight: "500",
    },
    selectOptionTextSelected: {
      color: colors.primaryForeground,
    },
    actionsContainer: {
      gap: 16,
    },
    submitButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      borderRadius: 12,
      gap: 8,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primaryForeground,
    },
    secondaryActions: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 24,
    },
    resetButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 16,
      gap: 6,
    },
    resetButtonText: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontWeight: "500",
    },
    cancelButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 16,
      gap: 6,
    },
    cancelButtonText: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontWeight: "500",
    },
    iconContainer: {
      marginBottom: 16,
    },
    iconGradient: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
    reset,
    watch,
    trigger,
    setError,
  } = useForm({
    defaultValues: data,
    resolver: joiResolver(validationSchema),
    mode: validateOnChange ? "onChange" : "onSubmit",
  });
  const watchedValues = watch();
  const [filledFields, setFilledFields] = useState(0);

  // Animation values
  const submitButtonScale = useSharedValue(1);
  const submitButtonOpacity = useSharedValue(1);
  const progressWidth = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(30);
  const [progress, setProgress] = useState(100);

  // Initialize animations
  useEffect(() => {
    formOpacity.value = withTiming(1, { duration: 600 });
    formTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, []);

/*   const calculateProgress = useCallback(() => {
    const totalFields = fields.length;
    const filledFields = fields.filter((field) => {
      const value = watchedValues[field.key as string];
      return (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        errors[field.key as string] === undefined
      );
    }).length;

    return (filledFields / totalFields) * 100;
  }, [watchedValues, fields, errors]); */

/*   useEffect(() => {
    if (!showProgress) return;
    const handler = setTimeout(() => {
      const progress = calculateProgress();
      progressWidth.value = withSpring(progress);
      setProgress(progress);
    }, 200);
    return () => clearTimeout(handler);
  }, [watchedValues]); */

  useEffect(() => {
    const filled = fields.filter((field) => {
      const value = watchedValues[field.key as string];
      return (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        errors[field.key as string] === undefined
      );
    }).length;
    setFilledFields(filled);
  }, [watchedValues, fields, errors]);

  // Animated styles
  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const submitButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: submitButtonScale.value }],
    opacity: submitButtonOpacity.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const submitButtonColorStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      isValid ? 1 : 0,
      [0, 1],
      [colors.muted, colors.primary]
    );
    return { backgroundColor };
  });

  const onFormSubmit = async (formData: any) => {
    console.log("Form data:", formData);
    setSubmissionState(true);
    try {
      await onSubmit(formData);

      // Success animation
      submitButtonScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    } catch (error) {
      // Error animation
      submitButtonScale.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withTiming(1.1, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      if (error instanceof CustomError) {
        error.fields.forEach((fieldError: FieldError) => {
          setError(fieldError.field, {
            type: "manual",
            message: fieldError.message,
          });
        });
      } else {
        setError("general", {
          type: "manual",
          message: "Error al enviar los datos",
        });
      }
    } finally {
      setSubmissionState(false);
    }
  };

  const handleReset = () => {
    Alert.alert("Reset Form", "Are you sure you want to reset all changes?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          reset(data);
        },
      },
    ]);
  };

  const setSubmissionState = (submitting: boolean) => {
    submitButtonOpacity.value = withTiming(submitting ? 0.7 : 1);
  };

  const renderField = (field: FieldConfig) => {
    const fieldError = errors[field.key as string];
    const hasError = !!fieldError;
    const fieldStyle = [
      styles.input,
      hasError && styles.inputError,
      field.disabled && styles.inputDisabled,
    ];

    switch (field.type) {
      case "boolean":
        return (
          <View key={field.key} style={styles.fieldContainer}>
            <View style={styles.booleanField}>
              <Controller
                control={control}
                name={field.key as string}
                render={({ field: { onChange, value } }) => (
                  <ThemedSwitch
                    value={value}
                    onValueChange={onChange}
                    hasError={!!errors[field.key as string]}
                    label={field.label}
                    description={field.description}
                    icon={field.icon}
                  />
                )}
              />
            </View>
            {hasError && (
              <Text style={styles.errorText}>
                {fieldError?.message as string}
              </Text>
            )}
          </View>
        );

      case "select":
        return (
          <View key={field.key} style={styles.fieldContainer}>
            <Text style={styles.label}>{field.label}</Text>
            {field.description && (
              <Text style={styles.fieldDescription}>{field.description}</Text>
            )}
            <Controller
              control={control}
              name={field.key as string}
              render={({ field: { onChange, value } }) => (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.selectContainer}
                >
                  {field.options?.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.selectOption,
                        value === option.value && styles.selectOptionSelected,
                      ]}
                      onPress={() => onChange(option.value)}
                      disabled={field.disabled}
                    >
                      <Text
                        style={[
                          styles.selectOptionText,
                          value === option.value &&
                            styles.selectOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            />
            {hasError && (
              <Text style={styles.errorText}>
                {fieldError?.message as string}
              </Text>
            )}
          </View>
        );

      case "textarea":
        return (
          <View key={field.key} style={styles.fieldContainer}>
            <Text style={styles.label}>{field.label}</Text>
            {field.description && (
              <Text style={styles.fieldDescription}>{field.description}</Text>
            )}
            <View style={styles.inputContainer}>
              <Controller
                control={control}
                name={field.key as string}
                render={({ field: { onChange, onBlur, value } }) => (
                  <ThemedTextArea
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={field.placeholder}
                    icon={field.icon}
                  />
                )}
              />
            </View>
            {field.maxLength && (
              <Text style={styles.characterCount}>
                {String(watchedValues[field.key as string] || "").length}/
                {field.maxLength}
              </Text>
            )}
            {hasError && (
              <Text style={styles.errorText}>
                {fieldError?.message as string}
              </Text>
            )}
          </View>
        );

      default:
        return (
          <View key={field.key} style={styles.fieldContainer}>
            <Text style={styles.label}>{field.label}</Text>
            {field.description && (
              <Text style={styles.fieldDescription}>{field.description}</Text>
            )}
            <Controller
              control={control}
              name={field.key as string}
              render={({ field: { onChange, onBlur, value } }) => (
                <ThemedTextInput
                  value={String(value || "")}
                  hasError={!!errors[field.key as string]}
                  onChangeText={(text) => {
                    const processedValue =
                      field.type === "number"
                        ? text === ""
                          ? null
                          : Number(text)
                        : text;
                    onChange(processedValue);

                    if (validateOnChange) {
                      trigger(field.key as string);
                    }
                  }}
                  onBlur={onBlur}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry={field.type === "password"}
                  maxLength={field.maxLength}
                  editable={!field.disabled}
                  returnKeyType="next"
                  icon={field.icon}
                />
              )}
            />
            {hasError && (
              <Text style={styles.errorText}>
                {fieldError?.message as string}
              </Text>
            )}
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={formAnimatedStyle}>
        {/* Header */}
        <View style={styles.header}>
          {/* Icon */}
          {icon && (
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[colors.primary, colors.accent]}
                style={styles.iconGradient}
              >
                {icon}
              </LinearGradient>
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

          {/* Progress Bar */}
          {showProgress && (
            <ProgressBar totalItems={fields.length} completedItems={filledFields} />
          )}
        </View>

        {/* Form Fields */}
        <View style={styles.fieldsContainer}>{fields.map(renderField)}</View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <AnimatedTouchableOpacity
            style={[
              styles.submitButton,
              submitButtonAnimatedStyle,
              submitButtonColorStyle,
            ]}
            onPress={handleSubmit(onFormSubmit)}
            disabled={isSubmitting || !isValid || isLoading}
            activeOpacity={0.8}
          >
            {isLoading && (
              <ActivityIndicator size="small" color={colors.primary} />
            )}
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Saving..." : submitLabel}
            </Text>
          </AnimatedTouchableOpacity>

          <View style={styles.secondaryActions}>
            {showResetButton && isDirty && (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
                activeOpacity={0.7}
              >
                <Text style={styles.resetButtonText}>{resetLabel}</Text>
              </TouchableOpacity>
            )}

            {onCancel && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default ObjectEditor;
