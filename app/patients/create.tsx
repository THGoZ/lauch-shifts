import ProgressBar from "@/components/ProgressBar";
import ThemedTextInput from "@/components/ThemedTextInput";
import { usePatients } from "@/context/PatientsContext";
import { CustomError } from "@/domain/entities/error-entity";
import schema from "@/domain/validators/schema";
import { useThemeColors } from "@/hooks/useThemeColors";
import { FieldError } from "@/interfaces/interface";
import { Ionicons } from "@expo/vector-icons";
import { joiResolver } from "@hookform/resolvers/joi";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


const fields = ["name", "lastname", "dni"];

export default function CreatePatientScreen() {
  const colors = useThemeColors();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardAvoid: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.foreground,
    },
    placeholder: {
      width: 40,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 20,
    },
    formHeader: {
      alignItems: "center",
      marginBottom: 32,
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
    formTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.foreground,
      marginBottom: 8,
    },
    formSubtitle: {
      fontSize: 16,
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 22,
    },
    formContainer: {
      gap: 20,
      marginBottom: 32,
    },
    fieldContainer: {
      gap: 8,
    },
    fieldLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.foreground,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.muted,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputError: {
      borderColor: colors.destructive,
      backgroundColor: "#fef2f2",
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      color: colors.foreground,
    },
    errorText: {
      fontSize: 14,
      color: colors.destructive,
      marginTop: 4,
    },
    fieldHint: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 4,
    },
    submitButton: {
      borderRadius: 16,
      marginBottom: 16,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    submitButtonDisabled: {
      shadowOpacity: 0,
      elevation: 0,
    },
    submitGradient: {
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
    },
    submitContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    submitButtonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.primaryForeground,
    },
    cancelButton: {
      alignItems: "center",
      paddingVertical: 16,
    },
    cancelButtonText: {
      fontSize: 16,
      color: colors.mutedForeground,
      fontWeight: "500",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm({
    resolver: joiResolver(schema.patientSchema),
  });

  const watchedValues = watch();
  const { addPatient, isLoading } = usePatients();
  const [filledFields, setFilledFields] = useState(0);

  const onSubmit = async (data: {
    name: string;
    lastname: string;
    dni: string;
  }) => {
    const result = await addPatient({
      name: data.name,
      lastname: data.lastname,
      dni: data.dni,
    });
    if (result.success) {
      router.back();
    } else {
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
  };

  useEffect(() => {
    const filled = fields.filter((field) => {
      const value = watchedValues[field];
      return value !== null && value !== "" && value !== undefined && errors[field] === undefined;
    }).length;
    setFilledFields(filled);
  }, [watchedValues, errors]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Create Patient</Text>

          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Form Header */}
            <View style={styles.formHeader}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  style={styles.iconGradient}
                >
                  <Ionicons
                    name="person-add"
                    size={32}
                    color={colors.primaryForeground}
                  />
                </LinearGradient>
              </View>
              <Text style={styles.formTitle}>Patient Information</Text>
              <Text style={styles.formSubtitle}>
                Fill in the details to create a new patient record
              </Text>
              <ProgressBar
                totalItems={fields.length}
                completedItems={filledFields}
              />
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              {/* Name Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>First Name *</Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, value } }) => (
                    <ThemedTextInput
                      placeholder="Enter first name"
                      value={value}
                      onChangeText={onChange}
                      hasError={!!errors.name}
                      icon="person-outline"
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  )}
                />
                {errors.name && (
                  <Text style={styles.errorText}>
                    {errors.name.message as string}
                  </Text>
                )}
              </View>

              {/* Lastname Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Last Name *</Text>
                <Controller
                  control={control}
                  name="lastname"
                  render={({ field: { onChange, value } }) => (
                    <ThemedTextInput
                      placeholder="Enter last name"
                      value={value}
                      onChangeText={onChange}
                      hasError={!!errors.lastname}
                      icon="person-outline"
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  )}
                />
                {errors.lastname && (
                  <Text style={styles.errorText}>
                    {errors.lastname.message as string}
                  </Text>
                )}
              </View>

              {/* DNI Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>DNI *</Text>
                <Controller
                  control={control}
                  name="dni"
                  render={({ field: { onChange, value } }) => (
                    <ThemedTextInput
                      placeholder="12345678A"
                      value={value}
                      onChangeText={onChange}
                      hasError={!!errors.dni}
                      icon="card-outline"
                      autoCapitalize="characters"
                      autoCorrect={false}
                      maxLength={9}
                    />
                  )}
                />
                {errors.dni && (
                  <Text style={styles.errorText}>
                    {errors.dni.message as string}
                  </Text>
                )}
                <Text style={styles.fieldHint}>
                  Format: 8 digits followed by a letter (e.g., 12345678A)
                </Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit((data) => onSubmit(data as any))}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  isLoading
                    ? [colors.mutedForeground, colors.mutedForeground]
                    : [colors.primary, colors.accent]
                }
                style={styles.submitGradient}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.submitButtonText}>Creating...</Text>
                  </View>
                ) : (
                  <View style={styles.submitContainer}>
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.primaryForeground}
                    />
                    <Text style={styles.submitButtonText}>Create Patient</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
