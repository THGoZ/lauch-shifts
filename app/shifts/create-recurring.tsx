import AnimatedView from "@/components/AnimatedView";
import ErrorDetails from "@/components/ErrorDetails";
import { usePatients } from "@/context/PatientsContext";
import { useShifts } from "@/context/ShiftsContext";
import { Shift } from "@/db/schema";
import { useThemeColors } from "@/hooks/useThemeColors";
import { getOverlappingShifts } from "@/services/shifts/shift.helpers";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { Calendar, DateData } from "react-native-calendars";
import { ProgressStep, ProgressSteps } from "react-native-progress-steps";

interface Patient {
  id: number;
  name: string;
  lastname: string;
  dni: string;
}

interface DaySchedule {
  dayId: number;
  start_time: Date;
  duration: number;
}

interface RecurringShiftForm {
  patient_id: number | null;
  startDate: Date;
  endDate: Date;
  daySchedules: DaySchedule[];
  status: "pending" | "confirmed" | "canceled";
}

// Mock patients data
const mockPatients: Patient[] = [
  { id: 1, name: "John", lastname: "Doe", dni: "12345678A" },
  { id: 2, name: "Jane", lastname: "Smith", dni: "87654321B" },
  { id: 3, name: "Maria", lastname: "Garcia", dni: "11223344C" },
];

const daysOfWeek = [
  { id: 1, name: "Monday", short: "Mon" },
  { id: 2, name: "Tuesday", short: "Tue" },
  { id: 3, name: "Wednesday", short: "Wed" },
  { id: 4, name: "Thursday", short: "Thu" },
  { id: 5, name: "Friday", short: "Fri" },
  { id: 6, name: "Saturday", short: "Sat" },
  { id: 0, name: "Sunday", short: "Sun" },
];

const durationOptions = [
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
  { value: 150, label: "2.5 hours" },
  { value: 180, label: "3 hours" },
];

export default function CreateRecurringShiftScreen() {
  const { patients, isLoading: patientsLoading, getPatients } = usePatients();
  const {
    getPureShiftsOfDate,
    isLoading: shiftsLoading,
    addShiftBulk,
    error: shiftsError,
  } = useShifts();
  const [form, setForm] = useState<RecurringShiftForm>({
    patient_id: null,
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    daySchedules: [],
    status: "pending",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTimePicker, setActiveTimePicker] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [validSchedules, setValidSchedules] = useState<boolean>(false);

  const colors = useThemeColors();

  const progressStepsStyle = {
    activeStepIconBorderColor: colors.primary,
    activeLabelColor: colors.primary,
    activeStepNumColor: colors.primaryForeground,
    activeStepIconColor: colors.primary,
    completedStepIconColor: colors.primary,
    completedProgressBarColor: colors.primary,
    completedCheckColor: colors.primaryForeground,
    progressBarColor: colors.muted,
    disabledStepNumColor: colors.mutedForeground,
    disabledStepIconColor: colors.muted,
    completedLabelColor: colors.primary,
  };

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
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    stepContent: {
      flex: 1,
      paddingVertical: 20,
    },
    stepHeader: {
      alignItems: "center",
      marginBottom: 32,
    },
    stepIconContainer: {
      marginBottom: 16,
    },
    stepIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    stepTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: colors.foreground,
      marginBottom: 8,
    },
    stepSubtitle: {
      fontSize: 16,
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 22,
    },
    patientsList: {
      gap: 12,
    },
    patientCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      borderWidth: 2,
      borderColor: colors.border,
    },
    patientCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.muted,
    },
    patientAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    patientAvatarText: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.primaryForeground,
    },
    patientInfo: {
      flex: 1,
    },
    patientName: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.foreground,
      marginBottom: 4,
    },
    patientDni: {
      fontSize: 14,
      color: colors.mutedForeground,
    },
    dateRangeContainer: {
      gap: 24,
    },
    dateSection: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dateSectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.foreground,
      marginBottom: 8,
    },
    selectedDateText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: "500",
      marginBottom: 16,
    },
    daysScheduleContainer: {
      gap: 12,
    },
    dayScheduleCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dayButton: {
      alignSelf: "center",
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      marginBottom: 12,
    },
    dayButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    dayButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.foreground,
    },
    dayButtonTextActive: {
      color: colors.primaryForeground,
    },
    dayScheduleConfig: {
      paddingTop: 8,
    },
    scheduleRow: {
      flexDirection: "row",
      gap: 12,
    },
    scheduleItem: {
      flex: 1,
    },
    scheduleLabel: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.mutedForeground,
      marginBottom: 6,
    },
    timePickerButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.muted,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    timePickerText: {
      flex: 1,
      fontSize: 15,
      color: colors.foreground,
      fontWeight: "500",
    },
    durationPickerContainer: {
      backgroundColor: colors.muted,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    durationPicker: {
      color: colors.foreground,
      fontSize: 1,
    },
    summaryContainer: {
      gap: 24,
    },
    summarySection: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    summarySectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.foreground,
      marginBottom: 12,
    },
    summaryPatientCard: {
      flexDirection: "row",
      alignItems: "center",
    },
    summaryPatientAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    summaryPatientAvatarText: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primaryForeground,
    },
    summaryPatientName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.foreground,
    },
    summaryPatientDni: {
      fontSize: 14,
      color: colors.mutedForeground,
    },
    summaryText: {
      fontSize: 16,
      color: colors.foreground,
      marginBottom: 4,
    },
    summaryScheduleItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    summaryDayName: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.foreground,
    },
    summaryScheduleText: {
      fontSize: 14,
      color: colors.mutedForeground,
    },
    summaryStatsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    summaryStatItem: {
      alignItems: "center",
    },
    summaryStatNumber: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 4,
    },
    summaryStatLabel: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontWeight: "500",
    },
  });

  useEffect(() => {
    const fetchPatients = async () => {
      await getPatients();
    };
    fetchPatients();
  }, []);

  const validateStep1 = (next = false) => {
    if (!form.patient_id) {
      if (next) {
        Alert.alert("Error", "Please select a patient");
      }
      return false;
    }
    return true;
  };

  const validateStep2 = (next = false) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!form.startDate || !form.endDate) {
      if (next) {
        Alert.alert("Error", "Please select both start and end dates.");
      }
      return false;
    }

    if (form.startDate < today) {
      if (next) {
        Alert.alert("Error", "Start date cannot be before today.");
      }
      return false;
    }

    if (form.endDate <= form.startDate) {
      if (next) {
        Alert.alert("Error", "End date must be after start date.");
      }
      return false;
    }

    return true;
  };
  const validateStep3 = () => {
    if (!validSchedules || form.daySchedules.length === 0) {
      return false;
    }
    return true;
  };

  const updateForm = (field: keyof RecurringShiftForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDayOfWeek = (dayId: number) => {
    const currentSchedules = [...form.daySchedules];
    const existingIndex = currentSchedules.findIndex(
      (ds) => ds.dayId === dayId
    );

    if (existingIndex > -1) {
      currentSchedules.splice(existingIndex, 1);
    } else {
      currentSchedules.push({
        dayId: dayId,
        start_time: new Date(new Date().setHours(9, 0, 0, 0)),
        duration: 60,
      });
    }

    updateForm("daySchedules", currentSchedules);
  };

  const updateDaySchedule = (
    dayId: number,
    field: "start_time" | "duration",
    value: Date | number
  ) => {
    const currentSchedules = [...form.daySchedules];
    const scheduleIndex = currentSchedules.findIndex(
      (ds) => ds.dayId === dayId
    );

    if (scheduleIndex > -1) {
      currentSchedules[scheduleIndex] = {
        ...currentSchedules[scheduleIndex],
        [field]: value,
      };
      updateForm("daySchedules", currentSchedules);
    }
  };

  useEffect(() => {
    if (form.daySchedules.length === 0) {
      setValidationErrors([]);
      return;
    }

    setIsLoading(true);
    setValidSchedules(false);
    let cancelled = false;
    setValidationErrors([]);

    const checkConflicts = async () => {
      const generatedShifts = generateShiftDates();
      const allConflicts: Shift[] = [];

      for (const shift of generatedShifts) {
        const shiftsOnDate = await getPureShiftsOfDate(shift.date);
        const conflicts = getOverlappingShifts(
          shiftsOnDate,
          shift.start_time,
          shift.duration
        );
        if (conflicts.length > 0) {
          allConflicts.push(...conflicts);
        }
      }

      if (!cancelled && allConflicts.length > 0) {
        manageConflicts(allConflicts);
      } else if (allConflicts.length === 0) {
        setValidSchedules(true);
      }
      setIsLoading(false);
    };

    const timer = setTimeout(checkConflicts, 1200);

    return () => {
      setIsLoading(false);
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.daySchedules, form.startDate, form.endDate]);

  const manageConflicts = (conflict: Shift[]) => {
    const conflicts = conflict.map((shift) => {
      const day = daysOfWeek.find(
        (d) => d.id === new Date(shift.date).getDay()
      );
      return {
        id: shift.id,
        title: "Conflicting Shift",
        message: `Patient ${shift.patient_id} is already booked on ${day?.name} ${shift.date} for ${shift.start_time} • ${shift.duration} min`,
        type: "warning",
        field: "shift.date",
        code: "VALIDATION_001",
        timestamp: new Date(),
      };
    });
    setValidationErrors((prev) => [...prev, ...conflicts]);
  };

  const clearConflicts = () => {
    setValidationErrors([]);
  };

  const generateShiftDates = () => {
    const shifts: Shift[] = [];
    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const daySchedule = form.daySchedules.find(
        (ds) => ds.dayId === dayOfWeek
      );

      if (daySchedule && form.patient_id) {
        shifts.push({
          patient_id: form.patient_id,
          date: currentDate.toISOString().split("T")[0],
          start_time: daySchedule.start_time.toTimeString().slice(0, 5),
          duration: daySchedule.duration,
          status: form.status,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
    return shifts;
  };

  const handleSubmit = async () => {
    const shiftsToCreate = generateShiftDates();

    setIsLoading(true);

    const result = await addShiftBulk(shiftsToCreate);

    if (result) {
      Alert.alert(
        "Success",
        `${shiftsToCreate.length} recurring shifts created successfully!`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      Alert.alert(
        "Error",
        "Failed to create recurring shifts. Please try again."
      );
      return;
    }
    setIsLoading(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setActiveTimePicker(null);
    if (selectedTime && activeTimePicker !== null) {
      updateDaySchedule(activeTimePicker, "start_time", selectedTime);
    }
  };

  const getSelectedPatient = () => {
    return patients.find((p) => p.id === form.patient_id);
  };

  const isDaySelected = (dayId: number) => {
    return form.daySchedules.some((ds) => ds.dayId === dayId);
  };

  const getDaySchedule = (dayId: number) => {
    return form.daySchedules.find((ds) => ds.dayId === dayId);
  };

  const onStartDatePress = (day: DateData) => {
    updateForm("startDate", new Date(day.dateString));
  };

  const onEndDatePress = (day: DateData) => {
    updateForm("endDate", new Date(day.dateString));
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

          <Text style={styles.headerTitle}>Create Recurring Shifts</Text>

          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <ProgressSteps {...progressStepsStyle}>
            {/* Step 1: Patient Selection */}
            <ProgressStep
              label="Patient"
              buttonNextText="Next"
              buttonNextTextColor={colors.secondaryForeground}
              buttonFillColor={colors.primary}
              buttonBorderColor={colors.border}
              buttonDisabledColor={colors.primary}
              buttonDisabledTextColor={colors.primaryForeground}
              buttonBottomOffset={40}
              onNext={() => validateStep1(true)}
              errors={!validateStep1()}
              scrollable={true}
              scrollViewProps={{ showsVerticalScrollIndicator: false }}
            >
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepIconContainer}>
                    <LinearGradient
                      colors={[colors.primary, colors.accent]}
                      style={styles.stepIcon}
                    >
                      <Ionicons
                        name="person"
                        size={24}
                        color={colors.primaryForeground}
                      />
                    </LinearGradient>
                  </View>
                  <Text style={styles.stepTitle}>Select Patient</Text>
                  <Text style={styles.stepSubtitle}>
                    Choose the patient for recurring shifts
                  </Text>
                </View>

                {patientsLoading ? (
                  <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                  <AnimatedView style={styles.patientsList}>
                    {patients.map((patient) => (
                      <TouchableOpacity
                        key={patient.id}
                        style={[
                          styles.patientCard,
                          form.patient_id === patient.id &&
                            styles.patientCardSelected,
                        ]}
                        onPress={() => updateForm("patient_id", patient.id)}
                      >
                        <View style={styles.patientAvatar}>
                          <Text style={styles.patientAvatarText}>
                            {patient.name.charAt(0)}
                            {patient.lastname.charAt(0)}
                          </Text>
                        </View>
                        <View style={styles.patientInfo}>
                          <Text style={styles.patientName}>
                            {patient.name} {patient.lastname}
                          </Text>
                          <Text style={styles.patientDni}>
                            DNI: {patient.dni}
                          </Text>
                        </View>
                        {form.patient_id === patient.id && (
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color={colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </AnimatedView>
                )}
              </View>
            </ProgressStep>

            {/* Step 2: Date Range Selection */}
            <ProgressStep
              label="Date Range"
              onNext={() => validateStep2(true)}
              errors={!validateStep2()}
              buttonNextText="Next"
              buttonNextTextColor={colors.secondaryForeground}
              buttonPreviousText="Previous"
              buttonPreviousTextColor={colors.secondaryForeground}
              buttonFillColor={colors.primary}
              buttonBorderColor={colors.border}
              buttonBottomOffset={40}
              scrollViewProps={{ showsVerticalScrollIndicator: false }}
              buttonDisabledColor={colors.primary}
              buttonDisabledTextColor={colors.primaryForeground}
            >
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepIconContainer}>
                    <LinearGradient
                      colors={[colors.primary, colors.accent]}
                      style={styles.stepIcon}
                    >
                      <Ionicons
                        name="calendar"
                        size={24}
                        color={colors.primaryForeground}
                      />
                    </LinearGradient>
                  </View>
                  <Text style={styles.stepTitle}>Select Date Range</Text>
                  <Text style={styles.stepSubtitle}>
                    Choose start and end dates for recurring shifts
                  </Text>
                </View>

                <View style={styles.dateRangeContainer}>
                  <View style={styles.dateSection}>
                    <Text style={styles.dateSectionTitle}>Start Date</Text>
                    <Text style={styles.selectedDateText}>
                      {formatDate(form.startDate)}
                    </Text>
                    <Calendar
                      onDayPress={onStartDatePress}
                      minDate={new Date().toISOString().split("T")[0]}
                      initialDate={form.startDate.toISOString().split("T")[0]}
                      markedDates={
                        form.startDate
                          ? {
                              [form.startDate.toISOString().split("T")[0]]: {
                                selected: true,
                                selectedColor: colors.primary,
                                selectedTextColor: colors.primaryForeground,
                              },
                            }
                          : {}
                      }
                      theme={{
                        backgroundColor: colors.background,
                        calendarBackground: colors.background,
                        selectedDayBackgroundColor: colors.primary,
                        selectedDayTextColor: colors.primaryForeground,
                        todayTextColor: colors.primary,
                        dayTextColor: colors.foreground,
                        textDisabledColor: colors.mutedForeground,
                        arrowColor: colors.primary,
                        monthTextColor: colors.foreground,
                      }}
                    />
                  </View>

                  <View style={styles.dateSection}>
                    <Text style={styles.dateSectionTitle}>End Date</Text>
                    <Text style={styles.selectedDateText}>
                      {formatDate(form.endDate)}
                    </Text>
                    <Calendar
                      onDayPress={onEndDatePress}
                      /* markedDates={getMarkedDatesForEnd()} */
                      minDate={form.startDate.toISOString().split("T")[0]}
                      initialDate={form.endDate.toISOString().split("T")[0]}
                      markedDates={
                        form.endDate
                          ? {
                              [form.endDate.toISOString().split("T")[0]]: {
                                selected: true,
                                selectedColor: colors.primary,
                                selectedTextColor: colors.primaryForeground,
                              },
                            }
                          : {}
                      }
                      theme={{
                        backgroundColor: colors.background,
                        calendarBackground: colors.background,
                        selectedDayBackgroundColor: colors.secondary,
                        selectedDayTextColor: colors.primaryForeground,
                        todayTextColor: colors.primary,
                        dayTextColor: colors.foreground,
                        textDisabledColor: colors.mutedForeground,
                        arrowColor: colors.secondary,
                        monthTextColor: colors.foreground,
                      }}
                    />
                  </View>
                </View>
              </View>
            </ProgressStep>

            {/* Step 3: Schedule Configuration */}
            <ProgressStep
              label="Schedule"
              onNext={() => validateStep3()}
              errors={!validateStep3()}
              buttonNextText="Next"
              buttonNextTextColor={
                !validSchedules || form.daySchedules.length === 0
                  ? colors.primaryForeground
                  : colors.secondaryForeground
              }
              buttonPreviousText="Previous"
              buttonPreviousTextColor={colors.secondaryForeground}
              buttonFillColor={colors.primary}
              buttonBorderColor={colors.border}
              buttonBottomOffset={40}
              buttonDisabledColor={colors.primary}
              buttonDisabledTextColor={colors.primaryForeground}
              scrollViewProps={{
                showsVerticalScrollIndicator: false,
                stickyHeaderIndices: [0],
              }}
            >
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  flexDirection: "column",
                }}
              >
                {validationErrors.length > 0 && (
                  <ErrorDetails
                    title="Form Validation Failed"
                    summary="Please fix the following issues before submitting"
                    errors={validationErrors}
                    type="warning"
                    collapsible={true}
                  />
                )}
                {isLoading && (
                  <ActivityIndicator size="large" color={colors.primary} />
                )}
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepIconContainer}>
                    <LinearGradient
                      colors={[colors.primary, colors.accent]}
                      style={styles.stepIcon}
                    >
                      <Ionicons
                        name="time"
                        size={24}
                        color={colors.primaryForeground}
                      />
                    </LinearGradient>
                  </View>
                  <Text style={styles.stepTitle}>Configure Schedule</Text>
                  <Text style={styles.stepSubtitle}>
                    Set time and duration for each day (
                    {form.daySchedules.length} days selected)
                  </Text>
                </View>
                <View style={styles.daysScheduleContainer}>
                  {daysOfWeek.map((day) => {
                    const isSelected = isDaySelected(day.id);
                    const daySchedule = getDaySchedule(day.id);

                    return (
                      <View key={day.id} style={styles.dayScheduleCard}>
                        <TouchableOpacity
                          style={[
                            styles.dayButton,
                            isSelected && styles.dayButtonActive,
                          ]}
                          onPress={() => toggleDayOfWeek(day.id)}
                        >
                          <Text
                            style={[
                              styles.dayButtonText,
                              isSelected && styles.dayButtonTextActive,
                            ]}
                          >
                            {day.name}
                          </Text>
                        </TouchableOpacity>

                        {isSelected && daySchedule && (
                          <View style={styles.dayScheduleConfig}>
                            <View style={styles.scheduleRow}>
                              <View style={styles.scheduleItem}>
                                <Text style={styles.scheduleLabel}>Time</Text>
                                <TouchableOpacity
                                  style={styles.timePickerButton}
                                  onPress={() => setActiveTimePicker(day.id)}
                                >
                                  <Ionicons
                                    name="time-outline"
                                    size={16}
                                    color={colors.mutedForeground}
                                  />
                                  <Text style={styles.timePickerText}>
                                    {formatTime(daySchedule.start_time)}
                                  </Text>
                                </TouchableOpacity>
                              </View>

                              <View style={styles.scheduleItem}>
                                <Text style={styles.scheduleLabel}>
                                  Duration
                                </Text>
                                <View style={styles.durationPickerContainer}>
                                  <Picker
                                    selectedValue={daySchedule.duration}
                                    onValueChange={(value) =>
                                      updateDaySchedule(
                                        day.id,
                                        "duration",
                                        value
                                      )
                                    }
                                    style={styles.durationPicker}
                                    dropdownIconColor={colors.foreground}
                                  >
                                    {durationOptions.map((option) => (
                                      <Picker.Item
                                        key={option.value}
                                        label={option.label}
                                        value={option.value}
                                      />
                                    ))}
                                  </Picker>
                                </View>
                              </View>
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>

                {activeTimePicker !== null && (
                  <DateTimePicker
                    value={
                      getDaySchedule(activeTimePicker)?.start_time || new Date()
                    }
                    mode="time"
                    is24Hour={true}
                    minuteInterval={30}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onTimeChange}
                  />
                )}
              </View>
            </ProgressStep>

            {/* Step 4: Summary and Confirmation */}
            <ProgressStep
              label="Summary"
              buttonFinishText="Create Shifts"
              buttonNextTextColor="white"
              buttonFillColor={colors.primary}
              buttonPreviousTextColor="white"
              onSubmit={handleSubmit}
            >
              <ScrollView
                style={styles.stepContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.stepHeader}>
                  <View style={styles.stepIconContainer}>
                    <LinearGradient
                      colors={[colors.success, colors.accent]}
                      style={styles.stepIcon}
                    >
                      <Ionicons
                        name="checkmark"
                        size={24}
                        color={colors.primaryForeground}
                      />
                    </LinearGradient>
                  </View>
                  <Text style={styles.stepTitle}>Summary</Text>
                  <Text style={styles.stepSubtitle}>
                    Review and confirm your recurring shifts
                  </Text>
                </View>

                <View style={styles.summaryContainer}>
                  {/* Patient Summary */}
                  <View style={styles.summarySection}>
                    <Text style={styles.summarySectionTitle}>Patient</Text>
                    <View style={styles.summaryPatientCard}>
                      <View style={styles.summaryPatientAvatar}>
                        <Text style={styles.summaryPatientAvatarText}>
                          {getSelectedPatient()?.name.charAt(0)}
                          {getSelectedPatient()?.lastname.charAt(0)}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.summaryPatientName}>
                          {getSelectedPatient()?.name}{" "}
                          {getSelectedPatient()?.lastname}
                        </Text>
                        <Text style={styles.summaryPatientDni}>
                          DNI: {getSelectedPatient()?.dni}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Date Range Summary */}
                  <View style={styles.summarySection}>
                    <Text style={styles.summarySectionTitle}>Date Range</Text>
                    <Text style={styles.summaryText}>
                      From: {formatDate(form.startDate)}
                    </Text>
                    <Text style={styles.summaryText}>
                      To: {formatDate(form.endDate)}
                    </Text>
                  </View>

                  {/* Schedule Summary */}
                  <View style={styles.summarySection}>
                    <Text style={styles.summarySectionTitle}>
                      Weekly Schedule
                    </Text>
                    {form.daySchedules.map((schedule) => {
                      const day = daysOfWeek.find(
                        (d) => d.id === schedule.dayId
                      );
                      return (
                        <View
                          key={schedule.dayId}
                          style={styles.summaryScheduleItem}
                        >
                          <Text style={styles.summaryDayName}>{day?.name}</Text>
                          <Text style={styles.summaryScheduleText}>
                            {formatTime(schedule.start_time)} •{" "}
                            {schedule.duration} min
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* Statistics */}
                  <View style={styles.summarySection}>
                    <Text style={styles.summarySectionTitle}>Statistics</Text>
                    <View style={styles.summaryStatsContainer}>
                      <View style={styles.summaryStatItem}>
                        <Text style={styles.summaryStatNumber}>
                          {generateShiftDates().length}
                        </Text>
                        <Text style={styles.summaryStatLabel}>
                          Total Shifts
                        </Text>
                      </View>
                      <View style={styles.summaryStatItem}>
                        <Text style={styles.summaryStatNumber}>
                          {(
                            generateShiftDates().reduce(
                              (total, shift) =>
                                total + (shift.duration ? shift.duration : 0),
                              0
                            ) / 60
                          ).toFixed(1)}
                          h
                        </Text>
                        <Text style={styles.summaryStatLabel}>Total Hours</Text>
                      </View>
                      <View style={styles.summaryStatItem}>
                        <Text style={styles.summaryStatNumber}>
                          {form.daySchedules.length}
                        </Text>
                        <Text style={styles.summaryStatLabel}>Days/Week</Text>
                      </View>
                      <View style={styles.content}>
                        {shiftsLoading && (
                          <ActivityIndicator
                            size="large"
                            color={colors.primary}
                          />
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </ProgressStep>
          </ProgressSteps>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
