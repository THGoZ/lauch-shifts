import { useAgendaListItems } from "@/hooks/useAgendaListItems";
import { useSelection } from "@/hooks/useSelectorHandler";
import { useThemeColors } from "@/hooks/useThemeColors";
import { ShiftWithPatient } from "@/interfaces/interface";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { AgendaList } from "react-native-calendars";
import AgendaItem from "../AgendaItem";
import ThemedLoading from "../ThemedLoading";
import ShiftsAgendaListSelectCheckbox from "./ShiftsAgendaListSelectCheckbox";
import ShiftsBulkActions from "./ShiftsBulkActions";

interface ShiftsAgendaListProps {
  shifts: ShiftWithPatient[];
  isRefreshing: boolean;
  onRefresh: () => void;
  shiftsLoading: boolean;
  onDetailsPress: (shiftId: number) => void;
  week: Date[];
}

const ShiftsAgendaList = ({
  shifts,
  isRefreshing,
  onRefresh,
  shiftsLoading,
  onDetailsPress,
  week,
}: ShiftsAgendaListProps) => {
  const colors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
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
        loadingContainer: {
          flex: 1,
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        section: {
          backgroundColor: "transparent",
          position: "relative",
        },
        listHeaderContainer: {
          padding: 8,
          borderBottomWidth: 1,
          borderColor: colors.border,
        }
      }),
    []
  );

  const {
    selectedItems,
    isInSelection,
    toggleSelection,
    selectedCount,
    clearSelection,
    selectMultiple,
  } = useSelection<string>({ multiSelect: true });

  const selectAll = () => {
    selectMultiple(shifts.map((shift) => shift.id.toString()));
  };

  const renderItem = useCallback(
    ({ item }: any) => {
      return (
        <>
          <AgendaItem
            item={item}
            isSelectMode={isInSelection}
            isSelected={selectedItems.includes(item.id.toString())}
            onSelectToggle={() => toggleSelection(item.id.toString())}
            selectItem={() => toggleSelection(item.id.toString())}
          />
        </>
      );
    },
    [isInSelection, selectedItems, toggleSelection]
  );

  const { agendaItems } = useAgendaListItems({ shifts, week, onDetailsPress });

  return (
    <>
      <ShiftsBulkActions
        selectedShiftsCount={selectedCount}
        onClearSelection={clearSelection}
        selectedShifts={selectedItems}
        onOperationComplete={onRefresh}
      />
      <AgendaList
        sections={agendaItems}
        renderItem={renderItem}
        ListHeaderComponent={
          shifts.length > 0 ? (
          <View style={styles.listHeaderContainer}>
            <ShiftsAgendaListSelectCheckbox
              items={shifts}
              selectedCount={selectedCount}
              onClearSelection={clearSelection}
              onSelectAll={selectAll}
            />
          </View>)
          : null
        }
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
              <ThemedLoading
                visible={true}
                type="bars"
                size="large"
                text="Loading shifts"
              />
            </View>
          ) : (
            <View
              style={[
                styles.emptyDate,
                {
                  alignContent: "center",
                  alignItems: "center",
                  flex: 1,
                  height: "100%",
                },
              ]}
            >
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
              <Text style={styles.emptyDateText}>
                No shifts scheduled on this date
              </Text>
              <View
                style={{
                  height: 2,
                  width: "70%",
                  backgroundColor: colors.border,
                }}
              ></View>
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
    </>
  );
};

export default ShiftsAgendaList;
