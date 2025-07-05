import { usePatients } from "@/context/PatientsContext";
import { useShifts } from "@/context/ShiftsContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function IndexScreen() {
  const colors = useThemeColors();

  const { activeShiftsCount, isLoading: shiftsLoading } = useShifts();
  const { patientsCount, isLoading: patientsLoading } = usePatients();

  const db = useSQLiteContext();
  useDrizzleStudio(db);

  const handleCreateShift = () => {
    router.push("/shifts/calendar");
  };

  const handleCreatePatient = () => {
    router.push("/patients");
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    gradient: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 40,
    },
    header: {
      alignItems: "center",
      marginBottom: 60,
    },
    iconContainer: {
      marginBottom: 24,
    },
    iconGradient: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    welcomeTitle: {
      fontSize: 18,
      color: colors.mutedForeground,
      marginBottom: 8,
      fontWeight: "400",
    },
    appTitle: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.foreground,
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 16,
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 22,
      maxWidth: width * 0.8,
    },
    buttonContainer: {
      gap: 16,
      marginBottom: 40,
    },
    primaryButton: {
      borderRadius: 16,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    buttonGradient: {
      borderRadius: 16,
      padding: 20,
    },
    buttonContent: {
      alignItems: "center",
      gap: 8,
    },
    primaryButtonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.primaryForeground,
    },
    buttonSubtext: {
      fontSize: 14,
      color: colors.primaryForeground,
      opacity: 0.9,
    },
    secondaryButton: {
      borderRadius: 16,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.background,
      shadowColor: colors.foreground,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    secondaryButtonContent: {
      padding: 20,
      alignItems: "center",
      gap: 8,
    },
    secondaryButtonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.primary,
    },
    secondaryButtonSubtext: {
      fontSize: 14,
      color: colors.mutedForeground,
    },
    statsContainer: {
      flexDirection: "row",
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 24,
      marginTop: "auto",
      marginBottom: 40,
      shadowColor: colors.foreground,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    statItem: {
      flex: 1,
      alignItems: "center",
    },
    statNumber: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontWeight: "500",
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginHorizontal: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <LinearGradient
        colors={[colors.background, colors.muted]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[colors.primary, colors.accent]}
                style={styles.iconGradient}
              >
                <Ionicons
                  name="medical"
                  size={40}
                  color={colors.primaryForeground}
                />
              </LinearGradient>
            </View>

            <Text style={styles.welcomeTitle}>Welcome to</Text>
            <Text style={styles.appTitle}>Shift Manager</Text>
            <Text style={styles.subtitle}>
              Manage your healthcare shifts and patient records efficiently
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCreateShift}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.buttonContent}>
                  <Ionicons
                    name="time-outline"
                    size={24}
                    color={colors.primaryForeground}
                  />
                  <Text style={styles.primaryButtonText}>Create Shift</Text>
                  <Text style={styles.buttonSubtext}>
                    Schedule a new work shift
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleCreatePatient}
              activeOpacity={0.8}
            >
              <View style={styles.secondaryButtonContent}>
                <Ionicons
                  name="person-add-outline"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.secondaryButtonText}>Create Patient</Text>
                <Text style={styles.secondaryButtonSubtext}>
                  Add a new patient record
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              {shiftsLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.statNumber}>{activeShiftsCount}</Text>
              )}
              <Text style={styles.statLabel}>Active Shifts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              {patientsLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.statNumber}>{patientsCount}</Text>
              )}
              <Text style={styles.statLabel}>Patients</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
