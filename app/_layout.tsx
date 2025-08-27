import { PatientsProvder } from "@/context/PatientsContext";
import { ShiftsProvider } from "@/context/ShiftsContext";
import { ToastProvider } from "@/context/ToastContext";
import { db } from "@/db/db";
import migrations from "@/drizzle/migrations";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { Suspense } from "react";
import { ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./globals.css";

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  const colors = useThemeColors();
  return (
    <Suspense fallback={<ActivityIndicator size={"large"} />}>
      <SQLiteProvider
        databaseName="lauch-shifts"
        options={{ enableChangeListener: true }}
        useSuspense
      >
        <ToastProvider>
          <PatientsProvder>
            <ShiftsProvider>
              <SafeAreaProvider>
                <GestureHandlerRootView>
                  <Stack>
                    <Stack.Screen
                      name="index"
                      options={{ headerShown: false }}
                    ></Stack.Screen>
                    <Stack.Screen
                      name="patients/index"
                      options={{ headerShown: false }}
                    ></Stack.Screen>
                    <Stack.Screen
                      name="patients/create"
                      options={{ headerShown: false }}
                    ></Stack.Screen>
                    <Stack.Screen
                      name="patients/[id]"
                      options={{
                        headerStyle: { backgroundColor: colors.background },
                        headerTitleStyle: {
                          color: colors.foreground,
                          fontWeight: "bold",
                        },
                        headerTitleAlign: "center",
                        headerTintColor: colors.foreground,
                        headerTitle: "Patient Details",
                      }}
                    ></Stack.Screen>
                    <Stack.Screen
                      name="shifts/index"
                      options={{ headerShown: false }}
                    ></Stack.Screen>
                    <Stack.Screen
                      name="shifts/create"
                      options={{ headerShown: false }}
                    ></Stack.Screen>
                    <Stack.Screen
                      name="shifts/create-single"
                      options={{ headerShown: false }}
                    ></Stack.Screen>
                    <Stack.Screen
                      name="shifts/create-recurring"
                      options={{ headerShown: false }}
                    ></Stack.Screen>
                    <Stack.Screen
                      name="shifts/calendar"
                      options={{ headerShown: false }}
                    ></Stack.Screen>
                  </Stack>
                </GestureHandlerRootView>
              </SafeAreaProvider>
            </ShiftsProvider>
          </PatientsProvder>
        </ToastProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
