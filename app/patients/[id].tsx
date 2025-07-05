import ErrorDisplay from "@/components/ErrorDisplay";
import ObjectEditor, { FieldConfig } from "@/components/ObjectEditor";
import { usePatients } from "@/context/PatientsContext";
import { Patient } from "@/db/schema";
import { CustomError } from "@/domain/entities/error-entity";
import schema from "@/domain/validators/schema";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const patientFields: FieldConfig[] = [
  {
    key: "name",
    label: "Name",
    type: "text",
    placeholder: "Enter patient name",
    icon: "person-outline",
  },
  {
    key: "lastname",
    label: "Last Name",
    type: "text",
    placeholder: "Enter patient last name",
    icon: "person-outline",
  },
  {
    key: "dni",
    label: "DNI",
    type: "text",
    placeholder: "414243444",
    icon: "card-outline",
  },
];

const EditPatient = () => {
  const colors = useThemeColors();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingVertical: 10,
    },
    scrollContent: {
      padding: 20,
      gap: 20,
    },
    keyboardAvoid: {
      flex: 1,
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      gap: 20,
    },
    loadingText: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.secondaryForeground,
    },
    retryButton: {
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      borderRadius: 8,
    },
  });

  const { id } = useLocalSearchParams();
  const { getPatient, updatePatient, isLoading } = usePatients();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const fetch = async () => {
      await fetchPatient();
    };

    fetch();
  }, [id]);

  const fetchPatient = async () => {
    const response = await getPatient(Number(id));
    if (response.success) {
      setPatient(response.result);
    } else {
      Alert.alert("Error", response.error.message);
    }
  };

  const handleSubmit = async (data: any) => {
    const result = await updatePatient({
      id: Number(id),
      name: data.name,
      lastname: data.lastname,
      dni: data.dni,
    });
    if (result.success) {
      router.back();
    } else {
      if (result.error instanceof CustomError) {
        throw result.error;
      }
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    } else if (patient) {
      return (
        <ObjectEditor
          title="Edit Patient"
          subtitle="Update patient information and medical details"
          icon={
            <Ionicons
              name="pencil-sharp"
              size={24}
              color={colors.primaryForeground}
            />
          }
          data={{
            name: patient.name,
            lastname: patient.lastname,
            dni: patient.dni,
          }}
          fields={patientFields}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Save Patient"
          showProgress={true}
          validateOnChange={true}
          validationSchema={schema.patientSchema}
          isLoading={isLoading}
        />
      );
    } else {
      return (
        <View style={styles.loadingContainer}>
          <ErrorDisplay
            message="Error fetching patient"
            className="mt-2 text-3xl"
          />
          <TouchableOpacity style={styles.retryButton} onPress={fetchPatient}>
            <Text style={styles.loadingText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderContent()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditPatient;
