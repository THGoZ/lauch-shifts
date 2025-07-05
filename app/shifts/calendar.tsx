import AgendaItem from "@/components/AgendaItem";
import ErrorDisplay from "@/components/ErrorDisplay";
import ItemDetailsModal from "@/components/items.detail.modal";
import ThemedCheckbox from "@/components/ThemedCheckbox";
import { useShifts } from "@/context/ShiftsContext";
import { useToast } from "@/context/ToastContext";
import { Filter } from "@/db/domain/utils/queryHandle";
import { shift } from "@/db/schema";
import { useThemeColors } from "@/hooks/useThemeColors";
import { ShiftWithPatient } from "@/interfaces/interface";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  AgendaList,
  CalendarProvider,
  ExpandableCalendar,
  LocaleConfig,
} from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

enum Status {
  Confirmed = "confirmed",
  Pending = "pending",
  Canceled = "canceled",
  All = "all",
}

LocaleConfig.locales["es"] = {
  monthNames: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  monthNamesShort: [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ],
  dayNames: [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ],
  dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
  today: "Hoy",
};
LocaleConfig.defaultLocale = "es";

const ExpandableCalendarScreen = () => {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    calendar: {
      paddingLeft: 20,
      paddingRight: 20,
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
    section: {
      backgroundColor: "transparent",
      position: "absolute",
    },
    addButton: {
      borderRadius: 20,
    },
    addButtonGradient: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    calendarContainer: {
      backgroundColor: colors.background,
      overflow: "hidden",
      borderBottomWidth: 1,
      borderColor: colors.border,
      borderBottomStartRadius: 12,
      borderBottomEndRadius: 12,
    },
    statsBar: {
      flexDirection: "row",
      backgroundColor: colors.background,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    statItem: {
      flex: 1,
      alignItems: "center",
    },
    statNumber: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontWeight: "500",
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
    emptyDate: {
      height: 120,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 32,
    },
    emptyDateText: {
      fontSize: 16,
      color: colors.mutedForeground,
      marginTop: 8,
    },
  });

  const {
    getShifts,
    isLoading: shiftsLoading,
    error,
    shifts: allshifts,
  } = useShifts();
  const { showToast } = useToast();

  const [items, setItems] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [shifts, setShifts] = useState<ShiftWithPatient[]>([]);
  const [detailsItem, setDetailsItem] = useState<ShiftWithPatient | null>(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] =
    useState<boolean>(false);

  useEffect(() => {
    const itemstoset = shifts.map((shift) => ({
      data: [
        {
          id: shift.id,
          date: shift.date,
          start_time: shift.start_time,
          duration: shift.duration,
          status: shift.status,
          details: shift.details,
          patient: shift.patient,
          onPress: () => onDetailsPress(shift),
        },
      ],
    }));
    setItems(itemstoset);
    setIsLoading(false);
  }, [shifts]);

  const renderItem = useCallback(({ item }: any) => {
    return <AgendaItem item={item} />;
  }, []);

  const calendarRef = useRef<{ toggleCalendarPosition: () => boolean }>(null);
  const rotation = useRef(new Animated.Value(0));
  const [filters, setFilters] = useState<Filter<typeof shift>[]>([
    {
      field: "date",
      value: selectedDate,
    },
  ]);
  const [statusFilter, setStatusFilter] = useState<Status>(Status.All);

  const onCalendarToggled = useCallback(
    (isOpen: boolean) => {
      rotation.current.setValue(isOpen ? 1 : 0);
    },
    [rotation]
  );

  const onDateChanged = useCallback(
    (date: string) => {
      setSelectedDate(date);
      setFilters([
        {
          field: "date",
          value: date,
        },
      ]);
    },
    [setSelectedDate]
  );

  const onToggleStatus = useCallback(
    (status: Status) => {
      setStatusFilter((prev) => {
        if (prev === status) return Status.All;
        return status;
      });
    },
    [setStatusFilter]
  );

  const onDetailsPress = useCallback(
    (shift: ShiftWithPatient) => {
      setDetailsItem(shift);
      setIsDetailsModalVisible(true);
    },
    [detailsItem]
  );

  const onDetailsClose = useCallback(() => {
    setDetailsItem(null);
    setIsDetailsModalVisible(false);
  }, []);

  useEffect(() => {
    const filteredShifts = allshifts.data.filter((shift: ShiftWithPatient) => {
      if (statusFilter === Status.All) return true;
      return shift.status === statusFilter;
    });
    setShifts(filteredShifts);
  }, [statusFilter, allshifts]);

  const loadShifts = async () => {
    const response = await getShifts(undefined, filters, true);
    if (response.success) {
      setShifts(response.result.data);
    } else {
      showToast(
        "error",
        "There has been an error fetching shifts",
        response.error.message
      );
    }
  };

  useEffect(() => {
    const fetchShifts = async () => {
      await loadShifts();
    };
    fetchShifts();
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      setSelectedDate(new Date().toISOString().split("T")[0]);
      loadShifts();
    }, [])
  );

  const renderPageContent = () => {
    if (isLoading) {
      return renderLoading();
    } else if (error) {
      return renderError();
    } else {
      return renderConent();
    }
  };

  const renderLoading = () => {
    return <ActivityIndicator size="large" color={colors.primary} />;
  };

  const renderError = () => {
    return (
      <ErrorDisplay message="Error al cargar los turnos" className="mt-2" />
    );
  };

  const renderConent = () => {
    return (
      <CalendarProvider
        date={selectedDate}
        onDateChanged={onDateChanged}
        showTodayButton
      >
        <View style={styles.calendarContainer}>
          <ExpandableCalendar
            ref={calendarRef}
            onCalendarToggled={onCalendarToggled}
            renderArrow={(direction) => {
              return (
                <Ionicons
                  name={
                    direction === "right"
                      ? "chevron-forward-outline"
                      : "chevron-back-outline"
                  }
                  size={28}
                  color={colors.accent}
                />
              );
            }}
            theme={{
              backgroundColor: colors.background,
              calendarBackground: colors.background,
              textSectionTitleColor: colors.foreground,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: colors.primaryForeground,
              todayTextColor: colors.primary,
              dayTextColor: colors.foreground,
              textDisabledColor: colors.mutedForeground,
              arrowColor: colors.primary,
              monthTextColor: colors.foreground,
              textDayFontWeight: "500",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "600",
            }}
            // disableAllTouchEventsForDisabledDays
            headerStyle={{
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
            firstDay={1}
            /* markedDates={marked.current} */
            /*           leftArrowImageSource={leftArrowIcon}
          rightArrowImageSource={rightArrowIcon} */
            // animateScroll
            // closeOnDayPress={false}
          />
        </View>
        {/* Stats Bar */}
        <View style={styles.statsBar}>
          {/*           <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {shifts.filter((s) => s.status === "confirmed").length}
            </Text>
            <Text style={styles.statLabel}>Confirmed</Text>
          </View> */}
          <ThemedCheckbox
            checked={statusFilter === Status.Confirmed}
            onPress={() => onToggleStatus(Status.Confirmed)}
            title="Confirmed"
            subtitle={allshifts.data
              .filter((s: ShiftWithPatient) => s.status === "confirmed")
              .length.toString()}
          />
          <View style={styles.statDivider} />
          {/* <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {shifts.filter((s) => s.status === "pending").length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View> */}
          <ThemedCheckbox
            variant="warning"
            checked={statusFilter === Status.Pending}
            onPress={() => onToggleStatus(Status.Pending)}
            title="Pending"
            subtitle={allshifts.data
              .filter((s: ShiftWithPatient) => s.status === "pending")
              .length.toString()}
          />
          <View style={styles.statDivider} />
          {/*           <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {shifts.filter((s) => s.status === "canceled").length}
            </Text>
            <Text style={styles.statLabel}>Canceled</Text>
          </View> */}
          <ThemedCheckbox
            variant="destructive"
            checked={statusFilter === Status.Canceled}
            onPress={() => onToggleStatus(Status.Canceled)}
            title="Canceled"
            subtitle={allshifts.data
              .filter((s: ShiftWithPatient) => s.status === "canceled")
              .length.toString()}
          />
        </View>
        {renderAgendaList()}
      </CalendarProvider>
    );
  };

  const renderAgendaList = () => {
    if (shiftsLoading) {
      return <ActivityIndicator size="large" color={colors.primary} />;
    }
    return (
      <AgendaList
        sections={items}
        renderItem={renderItem}
        ListEmptyComponent={() =>
          shiftsLoading ? (
            <View style={styles.emptyDate}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.emptyDate}>
              <Ionicons
                name="calendar-outline"
                size={32}
                color={colors.mutedForeground}
              />
              <Text style={styles.emptyDateText}>
                No shifts scheduled on this date
              </Text>
            </View>
          )
        }
        sectionStyle={styles.section}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ItemDetailsModal
        isOpen={isDetailsModalVisible}
        onClose={onDetailsClose}
        title={
          detailsItem?.patient?.name + " " + detailsItem?.patient?.lastname
        }
        onEdit={() => console.log("Editar")}
        onDelete={() => console.log("Borrar")}
      />
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Shifts</Text>

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
      {renderPageContent()}
    </SafeAreaView>
  );
};

export default ExpandableCalendarScreen;
