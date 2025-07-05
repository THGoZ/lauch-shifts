import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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

// Aquamarine Color Palette
const colors = {
  light: {
    background: "#f8fdfd",
    foreground: "#0a2e2e",
    primary: "#4fd1c7",
    primaryForeground: "#ffffff",
    secondary: "#7dd3d8",
    secondaryForeground: "#1a4b4b",
    accent: "#40e0d0",
    accentForeground: "#0f3333",
    muted: "#e6f7f7",
    mutedForeground: "#5a7a7a",
    border: "#b8e6e6",
    destructive: "#ef4444",
  },
};

interface Patient {
  id: number;
  name: string;
  lastname: string;
  dni: string;
}

interface ShiftForm {
  patient_id: number | null;
  date: string;
  start_time: string;
  duration: number;
  status: "pending" | "confirmed" | "canceled";
}

interface FormErrors {
  patient_id?: string;
  date?: string;
  start_time?: string;
  duration?: string;
}

// Mock patients data
const mockPatients: Patient[] = [
  { id: 1, name: "John", lastname: "Doe", dni: "12345678A" },
  { id: 2, name: "Jane", lastname: "Smith", dni: "87654321B" },
  { id: 3, name: "Maria", lastname: "Garcia", dni: "11223344C" },
];

// Time slots (every 30 minutes from 8:00 to 20:00)
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      const displayTime = formatTime(timeString);
      slots.push({ value: timeString, label: displayTime });
    }
  }
  return slots;
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const durationOptions = [
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
  { value: 150, label: "2.5 hours" },
  { value: 180, label: "3 hours" },
];

export default function CreateShiftScreen() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [form, setForm] = useState<ShiftForm>({
    patient_id: null,
    date: "",
    start_time: "09:00",
    duration: 60,
    status: "pending",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [timeSlots] = useState(generateTimeSlots());

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.patient_id) {
      newErrors.patient_id = "Please select a patient";
    }

    if (!form.date) {
      newErrors.date = "Please select a date";
    } else {
      const selectedDate = new Date(form.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = "Cannot schedule shifts in the past";
      }
    }

    if (!form.start_time) {
      newErrors.start_time = "Please select a start time";
    }

    if (!form.duration || form.duration < 15) {
      newErrors.duration = "Duration must be at least 15 minutes";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Creating shift:", form);

      Alert.alert("Success", "Shift created successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to create shift. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateForm = (field: keyof ShiftForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
/*     if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } */
  };

  const onDayPress = (day: DateData) => {
    updateForm("date", day.dateString);
  };

  const getMarkedDates = () => {
    const marked: any = {};

    if (form.date) {
      marked[form.date] = {
        selected: true,
        selectedColor: colors.light.primary,
      };
    }

    return marked;
  };

  const getSelectedPatient = () => {
    return patients.find((p) => p.id === form.patient_id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.light.background}
      />

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
            <Ionicons
              name="arrow-back"
              size={24}
              color={colors.light.foreground}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Create Shift</Text>

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
                  colors={[colors.light.primary, colors.light.accent]}
                  style={styles.iconGradient}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={32}
                    color={colors.light.primaryForeground}
                  />
                </LinearGradient>
              </View>
              <Text style={styles.formTitle}>Schedule New Shift</Text>
              <Text style={styles.formSubtitle}>
                Select patient, date, and time for the appointment
              </Text>
            </View>

            {/* Patient Selection */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Patient *</Text>
              <View
                style={[
                  styles.pickerContainer,
                  errors.patient_id && styles.inputError,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.light.mutedForeground}
                />
                <Picker
                  selectedValue={form.patient_id}
                  onValueChange={(value) => updateForm("patient_id", value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a patient..." value={null} />
                  {patients.map((patient) => (
                    <Picker.Item
                      key={patient.id}
                      label={`${patient.name} ${patient.lastname} (${patient.dni})`}
                      value={patient.id}
                    />
                  ))}
                </Picker>
              </View>
              {errors.patient_id && (
                <Text style={styles.errorText}>{errors.patient_id}</Text>
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
              <View style={styles.calendarContainer}>
                <Calendar
                  onDayPress={onDayPress}
                  markedDates={getMarkedDates()}
                  minDate={new Date().toISOString().split("T")[0]}
                  theme={{
                    backgroundColor: colors.light.background,
                    calendarBackground: colors.light.background,
                    textSectionTitleColor: colors.light.foreground,
                    selectedDayBackgroundColor: colors.light.primary,
                    selectedDayTextColor: colors.light.primaryForeground,
                    todayTextColor: colors.light.primary,
                    dayTextColor: colors.light.foreground,
                    textDisabledColor: colors.light.mutedForeground,
                    arrowColor: colors.light.primary,
                    monthTextColor: colors.light.foreground,
                    textDayFontWeight: "500",
                    textMonthFontWeight: "bold",
                    textDayHeaderFontWeight: "600",
                  }}
                />
              </View>
              {errors.date && (
                <Text style={styles.errorText}>{errors.date}</Text>
              )}
            </View>

            {/* Time Selection */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Start Time *</Text>
              <View
                style={[
                  styles.pickerContainer,
                  errors.start_time && styles.inputError,
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={colors.light.mutedForeground}
                />
                <Picker
                  selectedValue={form.start_time}
                  onValueChange={(value) => updateForm("start_time", value)}
                  style={styles.picker}
                >
                  {timeSlots.map((slot) => (
                    <Picker.Item
                      key={slot.value}
                      label={slot.label}
                      value={slot.value}
                    />
                  ))}
                </Picker>
              </View>
              {errors.start_time && (
                <Text style={styles.errorText}>{errors.start_time}</Text>
              )}
            </View>

            {/* Duration Selection */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Duration *</Text>
              <View
                style={[
                  styles.pickerContainer,
                  errors.duration && styles.inputError,
                ]}
              >
                <Ionicons
                  name="hourglass-outline"
                  size={20}
                  color={colors.light.mutedForeground}
                />
                <Picker
                  selectedValue={form.duration}
                  onValueChange={(value) => updateForm("duration", value)}
                  style={styles.picker}
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
              {errors.duration && (
                <Text style={styles.errorText}>{errors.duration}</Text>
              )}
            </View>

            {/* Status Selection */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Status</Text>
              <View style={styles.statusContainer}>
                {(["pending", "confirmed"] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      form.status === status && styles.statusButtonActive,
                    ]}
                    onPress={() => updateForm("status", status)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        form.status === status && styles.statusButtonTextActive,
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  isLoading
                    ? [
                        colors.light.mutedForeground,
                        colors.light.mutedForeground,
                      ]
                    : [colors.light.primary, colors.light.accent]
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
                      color={colors.light.primaryForeground}
                    />
                    <Text style={styles.submitButtonText}>Create Shift</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
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
    borderBottomColor: colors.light.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.light.foreground,
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
    color: colors.light.foreground,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: colors.light.mutedForeground,
    textAlign: "center",
    lineHeight: 22,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.light.foreground,
    marginBottom: 12,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.light.muted,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  inputError: {
    borderColor: colors.light.destructive,
    backgroundColor: "#fef2f2",
  },
  picker: {
    flex: 1,
    height: 50,
    color: colors.light.foreground,
  },
  errorText: {
    fontSize: 14,
    color: colors.light.destructive,
    marginTop: 8,
  },
  selectedPatientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  patientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  patientAvatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.light.primaryForeground,
  },
  selectedPatientName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.light.foreground,
  },
  selectedPatientDni: {
    fontSize: 14,
    color: colors.light.mutedForeground,
  },
  calendarContainer: {
    backgroundColor: colors.light.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light.border,
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
    borderColor: colors.light.border,
    backgroundColor: colors.light.background,
    alignItems: "center",
  },
  statusButtonActive: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primary,
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.light.foreground,
  },
  statusButtonTextActive: {
    color: colors.light.primaryForeground,
  },
  submitButton: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: colors.light.primary,
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
    color: colors.light.primaryForeground,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.light.mutedForeground,
    fontWeight: "500",
  },
});
