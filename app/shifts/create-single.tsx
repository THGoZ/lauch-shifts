import AnimatedView from "@/components/AnimatedView";
import CustomCalendar from "@/components/CustomCalendar";
import ErrorDisplay from "@/components/ErrorDisplay";
import ProgressBar from "@/components/ProgressBar";
import ThemedAccordion from "@/components/ThemedAccordion";
import ThemedButton from "@/components/ThemedButton";
import ThemedSelect from "@/components/ThemedSelect";
import ThemedTextArea from "@/components/ThemedTextArea";
import { usePatients } from "@/context/PatientsContext";
import { useShifts } from "@/context/ShiftsContext";
import { useToast } from "@/context/ToastContext";
import { Shift } from "@/db/schema";
import { CustomError } from "@/domain/entities/error-entity";
import schema from "@/domain/validators/schema";
import { useThemeColors } from "@/hooks/useThemeColors";
import {
  FieldError,
  ResultItem,
  ShiftWithPatient,
} from "@/interfaces/interface";
import { availableSlots } from "@/services/shifts/shift.helpers";
import { Ionicons } from "@expo/vector-icons";
import { joiResolver } from "@hookform/resolvers/joi";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const durationOptions = [
  //TODO: Implement this into the global settings
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
  { value: 150, label: "2.5 hours" },
  { value: 180, label: "3 hours" },
];

const fields = ["patient_id", "date", "start_time", "duration", "details"];

export default function CreateSingleShift() {
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
      paddingVertical: 16,
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
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
    headerContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    stickyProgressBar: {
      paddingHorizontal: 30,
      paddingVertical: 10,
      backgroundColor: colors.background,
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
    sectionContainer: {
      marginBottom: 24,
      gap: 5,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.foreground,
      marginBottom: 12,
      marginLeft: 4,
    },
    pickerContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.muted,
      borderRadius: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    inputError: {
      borderColor: colors.destructive,
      backgroundColor: "#fef2f2",
    },
    picker: {
      flex: 1,
      height: 50,
      color: colors.foreground,
    },
    errorText: {
      fontSize: 14,
      color: colors.destructive,
      marginTop: 8,
    },
    selectedPatientCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    patientAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    patientAvatarText: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primaryForeground,
    },
    selectedPatientName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.foreground,
    },
    selectedPatientDni: {
      fontSize: 14,
      color: colors.mutedForeground,
    },
    calendarContainer: {
      backgroundColor: colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    statusContainer: {
      flexDirection: "row",
      gap: 12,
    },
    statusButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      alignItems: "center",
    },
    statusButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    statusButtonText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.foreground,
    },
    statusButtonTextActive: {
      color: colors.primaryForeground,
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
    accordionContainer: {
      paddingVertical: 10,
      paddingHorizontal: 8,
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      marginTop: 20,
      overflow: "hidden",
    },
    accordionButton: {
      justifyContent: "space-between",
      alignItems: "center",
      flexDirection: "row",
      paddingEnd: 8,
    },
    accordionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 5,
    },
    accordionContent: {
      marginVertical: 10,
      maxHeight: 700,
    },
    shiftItem: {
      padding: 10,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      flexDirection: "row",
      justifyContent: "space-between",
    },
  });

  const params = useLocalSearchParams();
  const shiftId = params.id ? parseInt(params.id as string) : undefined;
  const isReprogramming : boolean = params.isReprogramming ? true : false;

  useEffect(() => {
    console.log(params)
  }, [params]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    setError,
    reset,
  } = useForm({
    resolver: joiResolver(schema.shiftSchema),
  });

  const watchedFields = watch();
  const [filledFields, setFilledFields] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);

  useEffect(() => {
    const filled = fields.filter((field) => {
      const value = watchedFields[field];
      return (
        value !== null &&
        value !== "" &&
        value !== undefined &&
        errors[field] === undefined
      );
    }).length;
    setFilledFields(filled);
  }, [watchedFields, errors]);

  const { patients, getPatients, isLoading } = usePatients();
  const {
    addShift,
    getShiftById,
    updateShift,
    isLoading: shifLoading,
    error: shiftError,
    getShiftByDate,
  } = useShifts();

  const { showToast } = useToast();
  const accordionOpen = useSharedValue(false);
  const chevronRotation = useSharedValue(0);
  const [shiftsOfDate, setShiftsOfDate] = useState<ShiftWithPatient[]>([]);

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  const openAccordion = () => {
    if (accordionOpen.value) {
      chevronRotation.value = withSpring(0, { damping: 12, stiffness: 200 });
      accordionOpen.value = false;
      return;
    }
    chevronRotation.value = withSpring(180, { damping: 12, stiffness: 200 });
    accordionOpen.value = true;
  };

  const [timeSlots, setTimeslots] = useState(
    [] as { value: string; label: string }[]
  );
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    if (shiftId) {
      setIsEditing(true);
      const fetchShiftData = async () => {
        const response = await getShiftById(shiftId);
        if (!response.success) {
          showToast(
            "error",
            "Error al obtener el turno",
            response.error.message
          );
          return;
        }
        const shift = response.result;
        setOriginalData({
          date: shift.date,
          details: shift.details || "",
        });

        /*         setValue("patient_id", shift.patient?.id);
        setValue("date", shift.date);
        setValue("start_time", shift.start_time);
        setValue("duration", shift.duration);
        setValue("details", shift.details || ""); */
        reset({
          patient_id: shift.patient?.id,
          date: shift.date,
          start_time: shift.start_time,
          duration: shift.duration,
          details: shift.details || "",
        });

        setSelectedDate(shift.date);
      };
      fetchShiftData();
    }
  }, [shiftId]);

  useEffect(() => {
    const fetchPatients = async () => {
      await getPatients();
    };
    fetchPatients();
  }, []);

  /*   useEffect(() => {
    const availableSlot = availableSlots(shifts);
    setTimeslots(availableSlot);
  }, [shifts]); */

  useEffect(() => {
    const fetchAndGenerateSlots = async () => {
      if (selectedDate.trim() !== "") {
        const response = await getShiftByDate(selectedDate);
        if (!response.success) {
          showToast(
            "error",
            "Error al obtener los turnos",
            response.error.message
          );
          return;
        }
        const shifts = response.result;

        const filteredShifts =
          isEditing && shiftId
            ? shifts.filter((shift) => shift.id !== shiftId)
            : shifts;

        setShiftsOfDate(filteredShifts);
        const availableSlot = availableSlots(filteredShifts);
        setTimeslots(availableSlot);
      }
    };
    fetchAndGenerateSlots();
  }, [selectedDate]);

  const getSelectedPatient = () => {
    return patients.data.find((p) => p.id === watch("patient_id"));
  };

  // const hasChanges = () => {
  //   if (!originalData) return true;

  //   const currentData = {
  //     patient_id: watch("patient_id"),
  //     date: watch("date"),
  //     start_time: watch("start_time"),
  //     duration: watch("duration"),
  //     details: watch("details") || "",
  //   };

  //   return JSON.stringify(currentData) !== JSON.stringify(originalData);
  // };

  const dateChanged = () => {
    if(!originalData) return false;
    if(!isReprogramming) return false;
    return watch("date") === originalData.date;
  }

  const onSubmit = async (data: {
    patient_id: number;
    date: string;
    start_time: string;
    duration: number;
    details: string;
  }) => {
    let success: ResultItem<Shift>;


    if(isReprogramming){
      data.details = data.details + `\n\nReprogramed from:\n${originalData.date} to ${data.date}`;
    }

    if (isEditing && shiftId) {
      success = await updateShift(shiftId, {
        //TODO: Add reprogramed status
        patient_id: data.patient_id,
        date: data.date,
        start_time: data.start_time,
        duration: data.duration,
        status: "pending",
        details: data.details,
      });
    } else {
      success = await addShift({
        patient_id: data.patient_id,
        date: data.date,
        start_time: data.start_time,
        duration: data.duration,
        status: "pending",
        details: data.details,
      });
    }

    if (success.success) {
      const action = isEditing ? "updated" : "created";
      showToast(
        "success",
        `Shift ${action} successfully`,
        `Shift ${action} with id ${success.result.id}`
      );
      router.back();
    } else {
      if (success.error instanceof CustomError) {
        success.error.fields.forEach((field: FieldError, index: number) => {
          setError(field.field, {
            type: "manual",
            message: success.error.additionalData[index] || field.message,
          });
        });
      }
      showToast(
        "error",
        `Error ${isEditing ? "updating" : "creating"} shift`,
        success.error.message
      );
      return;
    }
  };

  useEffect(() => {
    if (!shiftError) return;

    shiftError.fields.forEach((field, index) => {
      setError(field.field, {
        type: "manual",
        message:
          shiftError.additionalData[index] || "Possible overlapping shifts",
      });
    });
  }, [shiftError]);

  const renderLoading = () => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  };

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

          <Text style={styles.headerTitle}>
            {isEditing ? "Edit Shift" : "Create Shift"}
          </Text>

          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[1]}
        >
          {/* Form Header */}
          <View style={styles.headerContent}>
            <View style={styles.formHeader}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={[colors.primary, colors.accent]}
                  style={styles.iconGradient}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={32}
                    color={colors.primaryForeground}
                  />
                </LinearGradient>
              </View>
              <Text style={styles.formTitle}>
                {isEditing ? "Edit Shift" : "Schedule New Shift"}
              </Text>
              <Text style={styles.formSubtitle}>
                {isEditing
                  ? "Update patient, date, and time for the appointment"
                  : "Select patient, date, and time for the appointment"}
              </Text>
            </View>
          </View>
          <View style={styles.stickyProgressBar}>
            <ProgressBar
              totalItems={fields.length}
              completedItems={filledFields}
            />
          </View>
          <View style={styles.content}>
            {isLoading ? (
              renderLoading()
            ) : (
              <>
                {/* Patient Selection */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Patient *</Text>

                  <Controller
                    control={control}
                    name="patient_id"
                    render={({ field: { onChange, value } }) => (
                      <ThemedSelect
                        placeholder="Select a patient..."
                        value={value}
                        icon="person-outline"
                        onValueChange={onChange}
                        hasError={!!errors.patient_id}
                        disabled={isReprogramming}
                        options={patients.data.map((patient) => ({
                          label: `${patient.name} ${patient.lastname} (${patient.dni})`,
                          value: patient.id,
                        }))}
                      />
                    )}
                  />

                  {errors.patient_id && (
                    <ErrorDisplay
                      message={errors.patient_id.message as string}
                    />
                  )}

                  {getSelectedPatient() && (
                    <View style={styles.selectedPatientCard}>
                      <View style={styles.patientAvatar}>
                        <Text style={styles.patientAvatarText}>
                          {getSelectedPatient()!.name.charAt(0)}
                          {getSelectedPatient()!.lastname.charAt(0)}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.selectedPatientName}>
                          {getSelectedPatient()!.name}{" "}
                          {getSelectedPatient()!.lastname}
                        </Text>
                        <Text style={styles.selectedPatientDni}>
                          DNI: {getSelectedPatient()!.dni}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Date Selection */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Date *</Text>
                  <Controller
                    control={control}
                    name="date"
                    render={({ field: { onChange, value } }) => (
                      <CustomCalendar
                        onChange={(date) => {
                          onChange(date.toISOString().split("T")[0]);
                          setSelectedDate(date.toISOString().split("T")[0]);
                        }}
                        currentDate={value}
                        minDate={new Date()}
                        isValid={errors.date ? false : true}
                      />
                    )}
                  />
                  {errors.date && (
                    <ErrorDisplay message={errors.date.message as string} />
                  )}
                  <View
                    style={[
                      {
                        opacity: shiftsOfDate.length ? 1 : 0.6,
                      },
                      styles.accordionContainer,
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => openAccordion()}
                      style={styles.accordionButton}
                      disabled={!shiftsOfDate.length || shifLoading}
                    >
                      <View style={styles.accordionHeader}>
                        <Ionicons
                          name="briefcase-outline"
                          size={18}
                          color={colors.mutedForeground}
                        />
                        <Text
                          style={{
                            fontSize: 16,
                            color: colors.mutedForeground,
                          }}
                        >
                          Shifts on this date ({shiftsOfDate.length})
                        </Text>
                      </View>
                      <Animated.View style={chevronAnimatedStyle}>
                        <Ionicons
                          name="chevron-down"
                          size={20}
                          color={colors.mutedForeground}
                        />
                      </Animated.View>
                    </TouchableOpacity>
                    {shifLoading && (
                      <ActivityIndicator
                        size="small"
                        color={colors.mutedForeground}
                      />
                    )}
                    <ThemedAccordion isExpanded={accordionOpen} viewKey={1}>
                      <ScrollView
                        style={{
                          marginVertical: 10,
                          maxHeight: 700,
                        }}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                      >
                        {shiftsOfDate.map((shift) => (
                          <View
                            key={`shift_${shift.id}`}
                            style={styles.shiftItem}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 16,
                                  color: colors.foreground,
                                }}
                              >
                                {shift.patient?.name} {shift.patient?.lastname}
                              </Text>
                            </View>
                            <View style={{ alignItems: "center" }}>
                              <Text
                                style={{
                                  fontSize: 14,
                                  color: colors.mutedForeground,
                                }}
                              >
                                {shift.start_time}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 14,
                                  color: colors.mutedForeground,
                                }}
                              >
                                {shift.duration} minutes
                              </Text>
                            </View>
                          </View>
                        ))}
                      </ScrollView>
                    </ThemedAccordion>
                  </View>
                </View>

                {/* Time Selection */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Start Time *</Text>
                  <Controller
                    control={control}
                    name="start_time"
                    render={({ field: { onChange, value } }) => (
                      <ThemedSelect
                        placeholder="Select a time..."
                        value={value}
                        disabled={!timeSlots.length}
                        icon="time-outline"
                        onValueChange={onChange}
                        options={timeSlots}
                        hasError={!!errors.start_time}
                      />
                    )}
                  />
                  {errors.start_time && (
                    <ErrorDisplay
                      message={errors.start_time.message as string}
                    />
                  )}
                </View>

                {/* Duration Selection */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Duration *</Text>
                  <Controller
                    control={control}
                    name="duration"
                    render={({ field: { onChange, value } }) => (
                      <ThemedSelect
                        placeholder="Select a duration..."
                        value={value}
                        disabled={
                          !durationOptions.length || selectedDate.trim() === ""
                        }
                        icon="hourglass-outline"
                        onValueChange={onChange}
                        options={durationOptions}
                        hasError={!!errors.duration}
                      />
                    )}
                  />
                  {errors.duration && (
                    <ErrorDisplay message={errors.duration.message as string} />
                  )}
                </View>

                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Controller
                    control={control}
                    name="details"
                    render={({ field: { onChange, value } }) => (
                      <ThemedTextArea
                        placeholder="Enter shift details"
                        value={value}
                        onChangeText={onChange}
                        hasError={!!errors.details}
                        icon="document-text-outline"
                        autoCapitalize="words"
                        autoCorrect={false}
                      />
                    )}
                  />
                  {errors.details && (
                    <ErrorDisplay message={errors.details.message as string} />
                  )}
                </View>
                {shiftError && (
                  <AnimatedView style={{ marginBottom: 18 }}>
                    <ErrorDisplay message={shiftError.message} />
                  </AnimatedView>
                )}
                <View style={{ gap: 5, paddingBottom: 20 }}>
                  <ThemedButton
                    leftIcon="checkmark"
                    size="large"
                    variant="primary"
                    title="Create Shift"
                    loading={isLoading}
                    disabled={isLoading || (isEditing && !isDirty) || dateChanged()}
                    onPress={handleSubmit((data) => onSubmit(data as any))}
                  />

                  {/* Cancel Button */}
                  <ThemedButton
                    leftIcon="close-sharp"
                    size="large"
                    variant="ghost"
                    title="Cancel"
                    onPress={() => router.back()}
                    loading={isLoading}
                    disabled={isLoading}
                  />
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
