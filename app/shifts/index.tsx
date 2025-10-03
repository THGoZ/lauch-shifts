import ErrorDisplay from "@/components/ErrorDisplay";
import CalendarTypeSelector from "@/components/shifts/CalendarTypeSelector";
import DeleteShiftModal from "@/components/shifts/DeleteShiftModal";
import RescheludeShiftModal from "@/components/shifts/RescheludeShiftModal";
import ShiftCalendarProvider from "@/components/shifts/ShiftCalendarProvider";
import ShiftDetailsModal from "@/components/shifts/ShiftDetailsModal";
import ShiftsAgendaList from "@/components/shifts/ShiftsAgendaList";
import ShiftsStatusCount from "@/components/shifts/ShiftsStatusCount";
import ShiftsStatusFilter from "@/components/shifts/ShiftsStatusFilter";
import ShiftsTimeLineCalendar from "@/components/shifts/ShiftsTimeLineCalendar";
import ThemedButton from "@/components/ThemedButton";
import ThemedLoading from "@/components/ThemedLoading";
import { Status } from "@/constants/enums";
import { useCalendarDates } from "@/hooks/useCalendarDates";
import { useCalendarShiftDb } from "@/hooks/useCalendarShiftDb";
import { useMarkedDates } from "@/hooks/useMarkedDates";
import { usePatientDetails } from "@/hooks/usePatientDetails";
import { useShiftSelector } from "@/hooks/useShiftSelector";
import { useShiftsFilter } from "@/hooks/useShiftsFilter";
import { useShiftTimelineEvents } from "@/hooks/useShiftTimelineEvents";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useWeeklyShifts } from "@/hooks/useWeeklyShifts";
import { getTransparentColor } from "@/utils/colorTools";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ShiftsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
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
          textOverflow: "ellipsis",
        },
        addButton: {
          borderRadius: 20,
        },
        addButtonGradient: {
          width: 32,
          height: 32,
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
        },
        loadingContainer: {
          flex: 1,
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        errorContainer: {
          flex: 1,
          height: "100%",
          marginVertical: 20,
          alignItems: "center",
        },
        errorButtonsContainter: {
          flexDirection: "row",
          gap: 10,
          marginTop: 20,
        },
        calendarContainer: {
          backgroundColor: colors.background,
          overflow: "hidden",
          borderBottomWidth: 1,
          borderColor: colors.border,
          borderBottomStartRadius: 12,
          borderBottomEndRadius: 12,
        },
        modalContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 1,
        },
        addButtonsContainer: {
          flexDirection: "row",
          gap: 8,
        }
      }),
    [colors]
  );
  const { selectedDate, selectedMonth, onDateChanged, onMonthChange } =
    useCalendarDates();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const params = useLocalSearchParams();
  const patientId = params.id ? params.id.toString() : undefined;
  const { patient } = usePatientDetails({
    patientId,
  });

  const {
    shiftsOfMonth,
    isLoading: monthlyLoading,
    error,
    refreshShifts: refreshMontlyShifts,
  } = useCalendarShiftDb({
    selectedMonth: selectedMonth,
    patientId,
  });

  const {
    shiftsOfWeek,
    shifsOfDate,
    isLoading: weeklyLoading,
    refreshShifts: refreshWeeklyShifts,
    week,
    isRefreshing: weeklyRefreshing,
  } = useWeeklyShifts({
    selectedDate,
    patientId,
  });

  const [statusFilter, setStatusFilter] = useState<Status>(Status.All);
  const { filteredShifts } = useShiftsFilter({
    statusFilter,
    shifts: shiftsOfWeek,
  });

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      let isMounted = true;
      const loadData = async () => {
        if (isMounted) {
          await RefreshAll();
        }
      };
      loadData();
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const { markedDates } = useMarkedDates({ shifts: shiftsOfMonth });

  const [calendarType, setCalendarType] = useState<"Agenda" | "Timeline">(
    "Agenda"
  );

  const { timeLineEvents } = useShiftTimelineEvents({
    shiftsOfDate: shifsOfDate,
    selectedDate,
  });

  const {
    selectedShift: detailsItem,
    isVisible: isDetailsModalVisible,
    isLoading: detailsLoading,
    setShift: onOpenDetailsModal,
    resetShift: onCloseDetailsModal,
  } = useShiftSelector();

  const {
    selectedShift: rescheludeShift,
    isVisible: isrescheludeVisible,
    isLoading: rescheludeLoading,
    setShift: onOpenRescheludeModal,
    resetShift: onCloseRescheludeModal,
  } = useShiftSelector();

  const {
    selectedShift: deleteShift,
    isVisible: isDeleteVisible,
    isLoading: deleteLoading,
    setShift: onOpenDeleteModal,
    resetShift: onCloseDeleteModal,
  } = useShiftSelector();

  const RefreshAll = useCallback(async () => {
    await refreshWeeklyShifts();
    await refreshMontlyShifts();
  }, [refreshWeeklyShifts, refreshMontlyShifts]);

  const renderPageContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ThemedLoading
            visible={true}
            type="bars"
            size="large"
            text="Loading shifts"
          />
        </View>
      );
    } else if (error) {
      return renderError();
    } else {
      return renderConent();
    }
  };

  const renderError = () => {
    return (
      <View style={styles.errorContainer}>
        <ErrorDisplay message="Error al cargar los turnos" className="mt-2" />
        <View style={styles.errorButtonsContainter}>
          <ThemedButton
            title="Volver"
            variant="secondary"
            onPress={() => router.back()}
            size="small"
            rounded={true}
            leftIcon="arrow-back"
          />
          <ThemedButton
            title="Recargar"
            variant="primary"
            //TODO: Add reload function
            size="small"
            rounded={true}
            leftIcon="refresh"
          />
        </View>
      </View>
    );
  };

  const renderLoading = () => {
    return (
      <View style={styles.loadingContainer}>
        <ThemedLoading
          visible={true}
          type="bars"
          size="medium"
          text="Loading shifts"
        />
      </View>
    );
  };

  const renderConent = () => {
    return (
      <ShiftCalendarProvider
        markedDates={markedDates}
        selectedDate={selectedDate}
        selectedMonth={selectedMonth}
        onDateChanged={onDateChanged}
        onMonthChange={onMonthChange}
        isLoading={monthlyLoading}
      >
        {/* Stats Bar */}
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ gap: 10 }}>
            <CalendarTypeSelector
              selectedCalendarType={calendarType}
              setCalendarType={setCalendarType}
            />
            {calendarType === "Agenda" ? (
              <ShiftsStatusFilter
                shifts={shiftsOfWeek}
                setStatusFilter={setStatusFilter}
              />
            ) : (
              <ShiftsStatusCount
                selectedDate={selectedDate}
                shiftsOfDate={shifsOfDate}
              />
            )}
          </View>
        </View>
        {calendarType === "Agenda" ? renderAgendaList() : renderTimeLine()}
        <View style={styles.modalContainer}>
          {renderDetailsModal()}
          <RescheludeShiftModal
            rescheludeLoading={rescheludeLoading}
            rescheduleShiftId={rescheludeShift?.id}
            isRescheduleModalVisible={isrescheludeVisible}
            onRescheduleClose={onCloseRescheludeModal}
          />
          <DeleteShiftModal
            isDeleteShiftLoading={deleteLoading}
            deleteShiftId={deleteShift?.id}
            isDeleteModalVisible={isDeleteVisible}
            onDeleteClose={onCloseDeleteModal}
            refreshShifts={RefreshAll}
          />
        </View>
      </ShiftCalendarProvider>
    );
  };

  const renderTimeLine = () => {
    if (weeklyLoading) {
      return renderLoading();
    }
    return (
      <ShiftsTimeLineCalendar
        events={timeLineEvents}
        onDetailsPress={onOpenDetailsModal}
      />
    );
  };

  const renderAgendaList = () => {
    if (weeklyLoading) {
      return renderLoading();
    }
    return (
      <ShiftsAgendaList
        shifts={filteredShifts}
        isRefreshing={weeklyRefreshing}
        onRefresh={refreshWeeklyShifts}
        shiftsLoading={weeklyLoading}
        onDetailsPress={onOpenDetailsModal}
        week={week.current}
      />
    );
  };

  const renderDetailsModal = () => {
    if (detailsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ThemedLoading
            visible={true}
            type="bars"
            size="large"
            text="Loading shift details"
            overlay={true}
            overlayColor={getTransparentColor(colors.background, 0.5)}
          />
        </View>
      );
    }
    if (!detailsItem) {
      return null;
    }
    return (
      <ShiftDetailsModal
        detailsItem={detailsItem}
        isDetailsModalVisible={isDetailsModalVisible}
        onDetailsClose={onCloseDetailsModal}
        isLoading={isLoading}
        refreshShifts={RefreshAll}
        onReschedule={onOpenRescheludeModal}
        onDelete={onOpenDeleteModal}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        {isLoading ? (
          <ActivityIndicator size={"small"} color={colors.primary} />
        ) : (
          <Text style={styles.headerTitle}>
            {patientId
              ? `Shifts of ${patient?.name} ${patient?.lastname}`
              : "Shifts"}
          </Text>
        )}
        <View style={styles.addButtonsContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/shifts/create-recurring")}
          >
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              style={styles.addButtonGradient}
            >
              <Ionicons name="calendar-outline" size={24} color={colors.primaryForeground} />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/shifts/create-single")}
          >
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add" size={24} color={colors.primaryForeground} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1 }}>{renderPageContent()}</View>
    </SafeAreaView>
  );
}
