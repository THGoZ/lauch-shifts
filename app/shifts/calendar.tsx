import AgendaItem from "@/components/AgendaItem";
import ErrorDisplay from "@/components/ErrorDisplay";
import ItemDetailsModal, { ModalActions } from "@/components/ItemsDetailModal";
import ShiftEventDisplay from "@/components/ShiftEventDisplay";
import ThemedBasicModal from "@/components/ThemedBasicModal";
import ThemedButton from "@/components/ThemedButton";
import ThemedCheckbox from "@/components/ThemedCheckbox";
import ThemedRadioList, { RadioOption } from "@/components/ThemedRadioList";
import ThemedTextArea from "@/components/ThemedTextArea";
import TimelineCalendar from "@/components/TimelineCalendar";
import { shiftStatus } from "@/constants/enums";
import { useShifts } from "@/context/ShiftsContext";
import { useToast } from "@/context/ToastContext";
import { CompareFilter } from "@/db/domain/utils/queryHandle";
import { shift } from "@/db/schema";
import { CustomError } from "@/domain/entities/error-entity";
import schema from "@/domain/validators/schema";
import { useThemeColors } from "@/hooks/useThemeColors";
import { FieldError, ShiftWithPatient } from "@/interfaces/interface";
import {
  checkIfDateIsInRange,
  durationAddition,
  formatDuration,
  formatTime,
  getMarkedDates,
  getWeekRange,
  mapShiftsToEvents,
  returnShiftsWithSections,
} from "@/services/shifts/shift.helpers";
import { getTransparentColor } from "@/utils/colorTools";
import { Ionicons } from "@expo/vector-icons";
import { joiResolver } from "@hookform/resolvers/joi";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  AgendaList,
  CalendarProvider,
  CalendarUtils,
  DateData,
  ExpandableCalendar,
  LocaleConfig,
  TimelineProps,
} from "react-native-calendars";
import { MarkedDates } from "react-native-calendars/src/types";
import { useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

enum Status {
  Confirmed = "confirmed",
  Pending = "pending",
  Canceled = "canceled",
  All = "all",
}

interface ShiftSection {
  title: string;
  data: ShiftWithPatient[];
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

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
          position: "relative",
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
        },
        statItem: {
          flex: 1,
          alignItems: "center",
        },
        statNumber: {
          fontSize: 20,
          fontWeight: "bold",
          marginBottom: 2,
        },
        statLabel: {
          fontSize: 12,
          fontWeight: "500",
        },
        statDivider: {
          width: 1,
          backgroundColor: colors.border,
          marginHorizontal: 16,
        },
        emptyDate: {
          alignItems: "center",
          justifyContent: "center",
          alignContent: "center",
          gap: 8,
          marginVertical: 8,
        },
        emptyDateText: {
          fontSize: 16,
          color: colors.mutedForeground,
        },
        deleteModalContainer: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 1,
        },
        editStatusForm: {
          justifyContent: "center",
          alignItems: "center",
          padding: 5,
          gap: 5,
        },
        formContainer: {
          marginVertical: 7,
          width: "100%",
        },
        loadingContainer: {
          flex: 1,
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        rescheduleModalContent: {
          justifyContent: "flex-start",
          alignItems: "flex-start",
          marginHorizontal: 20,
        },
        rescheduleText: {
          fontSize: 16,
          color: colors.mutedForeground,
        },
        separator: {
          height: 1,
          backgroundColor: colors.border,
          marginVertical: 5,
        },
        actionsContainer: {
          marginBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          alignContent: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 8,
        },
        extraDetailsContainer: {
          marginVertical: 5,
          maxHeight: 200,
          gap: 10,
          flexDirection: "row",
        },
        shiftDeatilsContainer: {
          flexGrow: 1,
          padding: 10,
          borderWidth: 1,
          borderRadius: 12,
          borderColor: colors.border,
          backgroundColor: getTransparentColor(colors.secondaryMuted, 0.5),
        },
        extraDetailsText: {
          fontSize: 14,
          color: colors.secondaryForeground,
        },
      }),
    [colors]
  );

  const {
    getShifts,
    getShiftById,
    isLoading: shiftsLoading,
    error,
    shifts: allshifts,
    updateShift,
  } = useShifts();
  const { showToast } = useToast();

  const [items, setItems] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const selectedMonth = useRef(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [shifts, setShifts] = useState<ShiftSection[]>([]);
  const [detailsItem, setDetailsItem] = useState<ShiftWithPatient | null>(null);
  // const [isDetailsModalVisible, setIsDetailsModalVisible] =
  //   useState<boolean>(false);
  const isDetailsModalVisible = detailsItem ? true : false;
  const [rescheduleShiftId, setRescheduleShiftId] = useState<number | null>(
    null
  );
  const isRescheduleModalVisible = rescheduleShiftId ? true : false;
  const [statusFilter, setStatusFilter] = useState<Status>(Status.All);
  const [inSelection, setInSelection] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const week = useRef<Date[]>(getWeekRange(new Date()));
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  /*   const [filters, setFilters] = useState<Filter<typeof shift>[]>([
    {
      field: "date",
      value: selectedDate,
    },
  ]); */

  const [events, setEvents] = useState<any>({});

  const timelineProps: Partial<TimelineProps> = {
    format24h: true,
    overlapEventsSpacing: 8,
    onEventPress(event) {
        if (event.id !== undefined) {
          onDetailsPress(Number(event.id));
        }
    },
    renderEvent: (event) => {
      return <ShiftEventDisplay key={event.id} shift={event} />;
    },
    rightEdgeSpacing: 24,
    timelineLeftInset: 92,
    theme: {
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
      timeLabel: {
        fontSize: 14,
        color: colors.foreground,
      },
      verticalLine: {
        backgroundColor: colors.border,
      },
      line: {
        backgroundColor: colors.border,
      },
      event: {
        borderRightWidth: 6,
        borderwidth: 1,
        borderColor: colors.accent,
        backgroundColor: colors.primary,
        borderRadius: 20,
        shadowColor: colors.primary,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      },
    },
  };

  const INITIAL_TIME = { hour: 8, minutes: 0 };

  const [calendarType, setCalendarType] = useState<"Agenda" | "Timeline">(
    "Agenda"
  );
  const selectedCalendarIndex = useSharedValue(0);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  const updateEvents = useCallback(
    (shifts?: ShiftWithPatient[]) => {
      const filteredShifts = shifts
        ? shifts.filter((shift: ShiftWithPatient) => {
            return shift.date === selectedDate;
          })
        : allshifts.data.filter((shift: ShiftWithPatient) => {
            return shift.date === selectedDate;
          });
      setEvents(
        mapShiftsToEvents(
          CalendarUtils.getCalendarDateString(selectedDate),
          filteredShifts
        )
      );
      setIsLoading(false);
    },
    [selectedDate]
  );

  const loadShifts = async () => {
    try {
      const compareFilters: CompareFilter<typeof shift>[] = [
        {
          field: "date",
          value: week.current[0].toISOString().split("T")[0],
          compare: "gte",
        },
        {
          field: "date",
          value: week.current[6].toISOString().split("T")[0],
          compare: "lte",
        },
      ];
      const response = await getShifts(
        undefined,
        undefined,
        true,
        undefined,
        undefined,
        compareFilters
      );
      if (response.success) {
        const results = returnShiftsWithSections(
          response.result.data,
          week.current
        );
        setShifts(results);
        updateEvents(response.result.data);
      } else {
        showToast(
          "error",
          "There has been an error fetching shifts",
          response.error.message
        );
      }
    } catch (error) {
      console.log("Error loading shifts:", error);
      if (error instanceof Error) {
        showToast("error", "Error loading shifts", error.message);
      }
    }
  };

  const onMonthChange = (date: DateData) => {
    selectedMonth.current = date.dateString;
  };

  const loadMarkedDates = async () => {
    const month = new Date(selectedMonth.current);
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const monthFilter: CompareFilter<typeof shift>[] = [
      {
        field: "date",
        value: firstDay.toISOString().split("T")[0],
        compare: "gte",
      },
      {
        field: "date",
        value: lastDay.toISOString().split("T")[0],
        compare: "lte",
      },
    ];
    const shifts = await getShifts(
      undefined,
      undefined,
      false,
      undefined,
      undefined,
      monthFilter,
      false
    );
    if (shifts.success) {
      const marked = getMarkedDates(shifts.result.data);
      setMarkedDates(marked);
    } else {
      console.log("Error loading marked dates", shifts.error);
    }
  };

  useEffect(() => {
    loadMarkedDates();
  }, [selectedMonth.current]);

  useEffect(() => {
    const fetchShifts = async () => {
      await loadShifts();
    };
    const currentDate = new Date(selectedDate);
    const shouldUpdate = checkIfDateIsInRange(currentDate, week.current);
    if (!shouldUpdate) {
      updateEvents();
      return;
    }
    const newRange = getWeekRange(currentDate);
    week.current = newRange;

    fetchShifts();
  }, [selectedDate]);

  const onToggleStatus = useCallback(
    (status: Status) => {
      setStatusFilter(status);
    },
    [setStatusFilter]
  );

  useEffect(() => {
    const results = returnShiftsWithSections(filteredShifts, week.current);
    setShifts(results);
  }, [statusFilter, allshifts]);

  const filteredShifts = useMemo(() => {
    return allshifts.data.filter((shift: ShiftWithPatient) => {
      return statusFilter === Status.All || shift.status === statusFilter;
    });
  }, [allshifts, statusFilter]);

  useEffect(() => {
    mapShiftsToItems();
  }, [shifts]);

  const mapShiftsToItems = useCallback(() => {
    const itemstoset = shifts.map((shifts) => ({
      title: shifts.title,
      data: shifts.data.map((shift) => ({
        id: shift.id,
        date: shift.date,
        start_time: shift.start_time,
        duration: shift.duration,
        status: shift.status,
        details: shift.details,
        patient: shift.patient,
        onPress: () => onDetailsPress(shift.id),
      })),
    }));
    setItems(itemstoset);
    setIsLoading(false);
  }, [shifts]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const loadData = async () => {
        if (isMounted) {
          await loadShifts();
          setSelectedDate(new Date().toISOString().split("T")[0]);
        }
      };
      loadData();
      return () => {
        isMounted = false;
      };
    }, [])
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    setIsLoading(true);
    await loadShifts();
    setIsRefreshing(false);
    setIsLoading(false);
  };

  const onDetailsPress = useCallback(
    async (shiftId : number) => {
      // const response = await getShiftById(shiftId);
      // if (!response.success) {
      //   showToast("error", "Error al obtener el turno", response.error.message);
      //   return;
      // }
      // const shiftWithPatient = response.result;
      const shiftWithPatient = allshifts.data.find(shift => shift.id === shiftId);
      if (!shiftWithPatient) {
        showToast("error", "Error al obtener el turno", "Shift not found");
        return;
      }
      resetDetailsForm();
      setDetailsItem(shiftWithPatient);
      resetDetailsForm({
        status: shiftWithPatient.status,
        reason_incomplete: shiftWithPatient.reason_incomplete,
      });
    },
    [detailsItem]
  );

  const onDetailsClose = useCallback(async () => {
    setDetailsItem(null);
    setValue("status", null);
    setValue("reason_incomplete", null);
    clearErrors();
  }, [setDetailsItem]);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setError,
    setValue,
    clearErrors,
    watch,
    reset: resetDetailsForm,
  } = useForm({
    resolver: joiResolver(schema.updateStatusSchema),
  });

  const status = watch("status");

  const actions: ModalActions[] = [
    {
      label: "Save changes",
      icon: "checkmark-circle",
      onPress: handleSubmit((data) => onUpdateShift(data as any)),
      variant: "success",
      disabled: !isDirty,
      loading: isLoading,
    },
    {
      label: "Cancel",
      icon: "close-circle",
      onPress: () => onDetailsClose(),
      variant: "secondary",
    },
  ];

  const onUpdateShift = async (data: any) => {
    try {
      const result = await updateShift(detailsItem?.id as number, {
        status: data.status,
        reason_incomplete: data.reason_incomplete,
      });

      if (!result.success) {
        showToast(
          "error",
          "An error ocurred while updating the shift",
          "Shift not updated"
        );
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

      await loadShifts();
      showToast(
        "success",
        "Turno actualizado correctamente",
        "Turno actualizado"
      );
      onDetailsClose();
      if (
        status === shiftStatus.CANCELLED &&
        detailsItem?.status !== shiftStatus.CANCELLED
      ) {
        setRescheduleShiftId(detailsItem?.id as number);
        // setIsRescheduleModalVisible(true);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError("general", {
          type: "manual",
          message: error.message,
        });
        showToast("error", "Error al actualizar turno", error.message);
        return;
      }
      showToast("error", "Error al actualizar turno");
    }
  };

  const onReschedulePress = async () => {
    if (!rescheduleShiftId) {
      showToast(
        "error",
        "Error al reschedulear turno",
        "No se ha seleccionado un turno para reschedulear"
      );
      return;
    }
    router.push(
      `/shifts/create-single?id=${rescheduleShiftId}&isReprogramming=true`
    );
    onRescheduleClose();
  };

  const onRescheduleClose = () => {
    // setIsRescheduleModalVisible(false);
    setRescheduleShiftId(null);
  };

  const renderEditStatusForm = () => {
    return (
      <View style={styles.editStatusForm}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Controller
            control={control}
            name="status"
            render={({ field: { onChange, value } }) => (
              <>
                <ThemedCheckbox
                  title="Confirmed"
                  variant="success"
                  leftIcon={
                    value === "confirmed" ? "checkmark-circle" : undefined
                  }
                  checked={value === "confirmed"}
                  onPress={() => onChange("confirmed")}
                />
              </>
            )}
          />
          <Controller
            control={control}
            name="status"
            render={({ field: { onChange, value } }) => (
              <>
                <ThemedCheckbox
                  title="Pending"
                  variant="warning"
                  leftIcon={
                    value === "pending" ? "checkmark-circle" : undefined
                  }
                  checked={value === "pending"}
                  onPress={() => onChange("pending")}
                />
              </>
            )}
          />
          <Controller
            control={control}
            name="status"
            render={({ field: { onChange, value } }) => (
              <>
                <ThemedCheckbox
                  title="Canceled"
                  variant="destructive"
                  leftIcon={
                    value === "canceled" ? "checkmark-circle" : undefined
                  }
                  checked={value === "canceled"}
                  onPress={() => onChange("canceled")}
                />
              </>
            )}
          />
        </View>
        {errors.status && (
          <ErrorDisplay message={errors.status.message as string} />
        )}
        {status === "canceled" && (
          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="reason_incomplete"
              render={({ field: { onChange, value } }) => (
                <ThemedTextArea
                  placeholder="Reason incomplete"
                  value={value}
                  onChangeText={onChange}
                  hasError={!!errors.reason_incomplete}
                />
              )}
            />
            {errors.reason_incomplete && (
              <ErrorDisplay
                message={errors.reason_incomplete.message as string}
              />
            )}
          </View>
        )}
      </View>
    );
  };

  const renderExtraDetails = () => {
    if (detailsItem?.details === null) return null;
    return (
      <View style={styles.extraDetailsContainer}>
        <ScrollView style={styles.shiftDeatilsContainer}>
          <Text style={styles.extraDetailsText}>{detailsItem?.details}</Text>
        </ScrollView>
      </View>
    );
  };

  const handleSelectToggle = useCallback((itemId: string | number) => {
    setInSelection((prev) => !prev);
    setSelectedItems((prev) =>
      prev.includes(itemId.toString())
        ? prev.filter((id) => id !== itemId.toString())
        : [...prev, itemId.toString()]
    );
  }, []);

  const renderItem = useCallback(
    ({ item }: any) => {
      return (
        <>
          <AgendaItem
            item={item}
            isSelectMode={inSelection}
            isSelected={selectedItems.includes(item.id.toString())}
            onSelectToggle={handleSelectToggle}
          />
        </>
      );
    },
    [inSelection, selectedItems, handleSelectToggle]
  );

  const calendarRef = useRef<{ toggleCalendarPosition: () => boolean }>(null);
  const rotation = useRef(new Animated.Value(0));

  const onCalendarToggled = useCallback(
    (isOpen: boolean) => {
      rotation.current.setValue(isOpen ? 1 : 0);
    },
    [rotation]
  );

  const onDateChanged = useCallback(
    (date: string) => {
      setSelectedDate(date);
    },
    [setSelectedDate]
  );

  const selectedIndex = useSharedValue(0);

  const basicOptions: RadioOption[] = [
    {
      label: allshifts.data.length.toString(),
      description: "All",
      value: Status.All,
      thumbColor: colors.primary,
    },
    {
      label: allshifts.data
        .filter((s) => s.status === "confirmed")
        .length.toString(),
      description: "Confirmed",
      value: Status.Confirmed,
      thumbColor: colors.success,
    },
    {
      label: allshifts.data
        .filter((s) => s.status === "pending")
        .length.toString(),
      description: "Pending",
      value: Status.Pending,
      thumbColor: colors.warning,
    },
    {
      label: allshifts.data
        .filter((s) => s.status === "canceled")
        .length.toString(),
      description: "Canceled",
      value: Status.Canceled,
      thumbColor: colors.destructive,
    },
  ];

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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
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
        onMonthChange={onMonthChange}
        showTodayButton
      >
        <View style={styles.calendarContainer}>
          <ExpandableCalendar
            ref={calendarRef}
            markedDates={markedDates}
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
            headerStyle={{
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
            firstDay={1}
            /* markedDates={marked.current} */
          />
        </View>
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
            <ThemedRadioList
              items={[
                {
                  label: "Agenda",
                  value: "Agenda",
                  thumbColor: colors.accent,
                },
                {
                  label: "Timeline",
                  value: "Timeline",
                  thumbColor: colors.accent,
                },
              ]}
              onPress={(value) => {
                setCalendarType(value);
                selectedCalendarIndex.value = value === "Agenda" ? 0 : 1;
              }}
              size="medium"
              selectedIndex={selectedCalendarIndex}
            />
            {calendarType === "Agenda" ? (
              <View>
                <ThemedRadioList
                  items={basicOptions}
                  size="medium"
                  selectedIndex={selectedIndex}
                  onPress={(value) => {
                    onToggleStatus(value);
                  }}
                />
              </View>
            ) : (
              <View style={styles.statsBar}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: colors.success }]}>
                    {
                      allshifts.data.filter(
                        (s) =>
                          s.status === "confirmed" && s.date === selectedDate
                      ).length
                    }
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.success }]}>
                    Confirmed
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: colors.warning }]}>
                    {
                      allshifts.data.filter(
                        (s) => s.status === "pending" && s.date === selectedDate
                      ).length
                    }
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.warning }]}>
                    Pending
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text
                    style={[styles.statNumber, { color: colors.destructive }]}
                  >
                    {
                      allshifts.data.filter(
                        (s) =>
                          s.status === "canceled" && s.date === selectedDate
                      ).length
                    }
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.destructive }]}
                  >
                    Canceled
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
        {/* {renderAgendaList()} */}
        {calendarType === "Agenda" ? renderAgendaList() : renderTimeLine()}

        {/* Details Modal */}
        {detailsItem && (
          <View style={styles.deleteModalContainer}>
            <ItemDetailsModal
              metadata={[
                {
                  label: "Patient",
                  value: `${detailsItem.patient?.name} ${detailsItem.patient?.lastname}`,
                  icon: (
                    <Ionicons
                      name="person-outline"
                      size={16}
                      color={colors.accent}
                    />
                  ),
                },
                {
                  label: "DNI",
                  value: detailsItem.patient?.dni,
                  icon: (
                    <Ionicons
                      name="card-outline"
                      size={16}
                      color={colors.accent}
                    />
                  ),
                },
                {
                  label: "Date",
                  value: detailsItem.date,
                  icon: (
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={colors.accent}
                    />
                  ),
                },
                {
                  label: "Start Time",
                  value: formatTime(detailsItem.start_time, false),
                  icon: (
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={colors.accent}
                    />
                  ),
                },
                {
                  label: "End Time",
                  value: durationAddition(
                    detailsItem.start_time,
                    detailsItem.duration,
                    true
                  ),
                  icon: (
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={colors.accent}
                    />
                  ),
                },
                {
                  label: "Duration",
                  value: formatDuration(detailsItem.duration),
                  icon: (
                    <Ionicons
                      name="hourglass-outline"
                      size={16}
                      color={colors.accent}
                    />
                  ),
                },
                {
                  label: "Reprogramed",
                  value: detailsItem.reprogramed
                    ? detailsItem.reprogramed === true
                      ? "Yes"
                      : "No"
                    : "No",
                  icon: (
                    <Ionicons
                      name="help-circle-outline"
                      size={16}
                      color={colors.accent}
                    />
                  ),
                },
              ]}
              isOpen={isDetailsModalVisible}
              onClose={() => onDetailsClose()}
              title={`Showing shift details`}
              subtitle={"Shift details:"}
              onEdit={() => {
                router.push(`/shifts/create-single?id=${detailsItem.id}`);
              }}
              onDelete={() => console.log("Borrar")}
              actions={actions}
            >
              <View>
                {renderExtraDetails()}
                {renderEditStatusForm()}
              </View>
            </ItemDetailsModal>
          </View>
        )}
        <View style={styles.deleteModalContainer}>
          {rescheduleShiftId && (
            <ThemedBasicModal
              isOpen={isRescheduleModalVisible}
              onClose={() => setRescheduleShiftId(null)}
              title={`Reschedule shift N° ${rescheduleShiftId}`}
            >
              <View style={styles.rescheduleModalContent}>
                <Text style={styles.rescheduleText}>
                  Reschedule this shift?
                </Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.actionsContainer}>
                <ThemedButton
                  onPress={onReschedulePress}
                  title="Yes"
                  variant="success"
                  size="small"
                  rounded={true}
                  leftIcon="checkmark"
                  loading={false}
                />
                <ThemedButton
                  onPress={onRescheduleClose}
                  title="No"
                  variant="secondary"
                  size="small"
                  rounded={true}
                  leftIcon="close-sharp"
                  loading={false}
                />
              </View>
            </ThemedBasicModal>
          )}
        </View>
      </CalendarProvider>
    );
  };

  const renderAgendaList = () => {
    if (shiftsLoading) {
      return renderLoading();
    }
    return (
      <AgendaList
        sections={items}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        renderSectionFooter={({ section }) => {
          if (section.data.length === 0) {
            return (
              <View style={styles.emptyDate}>
                <View
                  style={{
                    height: 2,
                    width: "70%",
                    backgroundColor: colors.border,
                  }}
                ></View>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.mutedForeground}
                />
                <Text style={styles.emptyDateText}>No shifts for this day</Text>
                <View
                  style={{
                    height: 2,
                    width: "70%",
                    backgroundColor: colors.border,
                  }}
                ></View>
              </View>
            );
          }
          return null;
        }}
        ListEmptyComponent={() =>
          shiftsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.emptyDate}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={colors.mutedForeground}
              />
              <Text style={styles.emptyDateText}>
                No shifts scheduled on this date
              </Text>
            </View>
          )
        }
        sectionStyle={styles.section}
        stickyHeaderHiddenOnScroll={true}
        SectionSeparatorComponent={() => (
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 10,
              marginBottom: 5,
            }}
          >
            <View
              style={{
                height: 2,
                width: "70%",
                backgroundColor: colors.border,
              }}
            />
          </View>
        )}
      />
    );
  };

  const renderTimeLine = () => {
    if (shiftsLoading || isLoading) {
      return <ActivityIndicator size="large" color={colors.primary} />;
    }
    return (
      <TimelineCalendar
        events={events}
        timelineProps={timelineProps}
        initialTime={INITIAL_TIME}
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
      <View style={{ flex: 1 }}>{renderPageContent()}</View>
    </SafeAreaView>
  );
};

export default ExpandableCalendarScreen;
