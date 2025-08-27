import { useThemeColors } from "@/hooks/useThemeColors";
import { Feather } from "@expo/vector-icons";
import { Image as EImage } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AnimatedView from "./AnimatedView";
import CustomCalendar from "./CustomCalendar";
import ThemedSwitch from "./ThemedSwitch";

export interface BaseFilterOption {
  key: string;
  label: string;
  type: "select" | "multiselect" | "date" | "range" | "toggle";
}

export interface SelectFilterOption extends BaseFilterOption {
  type: "select" | "multiselect";
  displayIcons?: "icons" | "text" | "both";
  options: { label: string; value: any }[];
}

export interface RangeFilterOption extends BaseFilterOption {
  type: "range";
  min?: number;
  max?: number;
}

export interface DateFilterOption extends BaseFilterOption {
  type: "date";
}

export interface ToggleFilterOption extends BaseFilterOption {
  onLabel?: string;
  offLabel?: string;
  onIcon?: any;
  offIcon?: any;
  type: "toggle";
}

export type FilterOption =
  | SelectFilterOption
  | RangeFilterOption
  | DateFilterOption
  | ToggleFilterOption;

export interface SingleFilterSelectProps {
  filter: FilterOption;
  value: any;
  onChange: (value: any) => void;
  isAccordionOpen: boolean;
  setAccordionOpen: (id: string) => void;
  closeAccordion: () => void;
  modalTitle?: string;
  buttonLabel?: string;
  buttonStyle?: object;
  buttonTextStyle?: object;
  modalStyle?: object;
}

const SingleFilterSelect: React.FC<SingleFilterSelectProps> = ({
  filter,
  value,
  onChange,
  isAccordionOpen,
  setAccordionOpen,
  closeAccordion,
  buttonLabel,
}) => {
  const colors = useThemeColors();
  const [tempValue, setTempValue] = useState<any>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (isAccordionOpen) {
      setTempValue(value);
    }
  }, [value, isAccordionOpen]);

  const handleApply = () => {
    onChange(tempValue);
    closeAccordion();
  };

  const handleClear = () => {
    const emptyValue = getEmptyValue();
    setTempValue(emptyValue);
    onChange(emptyValue);
    closeAccordion();
  };

  const pickDate = (newdate: Date) => {
    setShowDatePicker(false);
    setTempValue(newdate.toISOString().split("T")[0]);
  };

  const getEmptyValue = () => {
    switch (filter.type) {
      case "select":
        return null;
      case "multiselect":
        return [];
      case "date":
        return null;
      case "range":
        return { min: undefined, max: undefined };
      case "toggle":
        return null;
      default:
        return null;
    }
  };

  const getDisplayValue = () => {
    if (value === null || value === undefined) {
      return "Todos";
    }

    switch (filter.type) {
      case "select":
        const option = filter.options.find((opt) => opt.value === value);
        return option ? option.label : "Todos";
      case "multiselect":
        if (!Array.isArray(value) || value.length === 0) return "Todos";
        if (value.length === 1) {
          const option = filter.options.find((opt) => opt.value === value[0]);
          return option ? option.label : "Todos";
        }
        return `${value.length} seleccionados`;
      case "date":
        return value ? new Date(value).toLocaleDateString() : "Todos";
      case "range":
        const min = value?.min;
        const max = value?.max;
        if (min !== undefined && max !== undefined) {
          return `${min} - ${max}`;
        } else if (min !== undefined) {
          return `Min: ${min}`;
        } else if (max !== undefined) {
          return `Max: ${max}`;
        }
        return "Todos";
      case "toggle":
        return value
          ? (filter as ToggleFilterOption).onLabel ?? "On"
          : (filter as ToggleFilterOption).offLabel ?? "Off";
      default:
        return "Todos";
    }
  };

  const renderFilterContent = () => {
    switch (filter.type) {
      case "select":
        return renderSelectFilter();
      case "multiselect":
        return renderMultiSelectFilter();
      case "date":
        return renderDateFilter();
      case "range":
        return renderRangeFilter();
      case "toggle":
        return renderToggleFilter();
      default:
        return null;
    }
  };

  const renderSelectFilter = () => (
    <View className="flex flex-row flex-wrap gap-1 items-center justify-center">
      {(filter as SelectFilterOption).options.map((option, index) => (
        <TouchableOpacity
          className={`justify-center items-center flex-row rounded-2xl border-2 px-3 py-2 m-1`}
          style={{
            backgroundColor: tempValue === option.value
              ? colors.accent
              : colors.background,
            borderColor: colors.accent,
          }}
          key={option.value}
          onPress={() => setTempValue(option.value)}
        >
          <View className="flex-row items-center gap-2">
            {((filter as SelectFilterOption).displayIcons === "text" ||
              (filter as SelectFilterOption).displayIcons === "both" ||
              (filter as SelectFilterOption).displayIcons === undefined) && (
              <Text
                className={`font-semibold text-md mx-1`}
                style={{ color: tempValue === option.value ? colors.accentForeground : colors.mutedForeground }}
              >
                {option.label}
              </Text>
            )}
            {tempValue === option.value && (
              <Feather name="check" size={18} color={colors.accentForeground} />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMultiSelectFilter = () => {
    const toggleOption = (optionValue: string) => {
      if (!Array.isArray(tempValue)) {
        setTempValue([optionValue]);
        return;
      }

      if (tempValue.includes(optionValue)) {
        setTempValue(tempValue.filter((v) => v !== optionValue));
      } else {
        setTempValue([...tempValue, optionValue]);
      }
    };

    const isSelected = (optionValue: string) => {
      return Array.isArray(tempValue) && tempValue.includes(optionValue);
    };

    return (
      <View className="flex flex-row flex-wrap gap-1 items-center justify-center">
        {(filter as SelectFilterOption).options.map((option) => (
          <TouchableOpacity
            className={`justify-center items-center flex-row rounded-2xl border-2 px-3 py-2 m-1`}
            key={option.value}
            style={{
              backgroundColor: isSelected(option.value)
                ? colors.accent
                : colors.background,
              borderColor: colors.accent,
            }}
            onPress={() => toggleOption(option.value)}
          >
            {/*             {((filter as SelectFilterOption).displayIcons === "icons" ||
              (filter as SelectFilterOption).displayIcons === "both") && (
              <Image source={option.icon} className="w-6 h-6" />
            )} */}
            {((filter as SelectFilterOption).displayIcons === "text" ||
              (filter as SelectFilterOption).displayIcons === "both" ||
              (filter as SelectFilterOption).displayIcons === undefined) && (
              <Text
                className={`font-semibold text-md mx-1`}
                style={{ color: isSelected(option.value) ? colors.accentForeground : colors.mutedForeground }}
              >
                {option.label}
              </Text>
            )}
            {isSelected(option.value) && (
              <Feather name="check" size={18} color={colors.accentForeground} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderDateFilter = () => {
    const currentDate = tempValue ? new Date(tempValue) : new Date();

    return (
      <View className="flex items-center justify-center gap-2">
        <Text className="font-semibold text-lg mx-1"
        style={{ color: colors.mutedForeground }}>
          Fecha seleccionada:
        </Text>
        <TouchableOpacity
          className="flex-row border rounded-2xl items-center border-accent px-3 py-1"
          onPress={() => setShowDatePicker(true)}
        >
          <EImage
            source={require("@/assets/icons/svg/calendar-blank-outline.svg")}
            style={{ width: 20, height: 20 }}
            tintColor={colors.accent}
          ></EImage>
          <Text className="font-bold text-lg mx-1"
          style={{ color: colors.accent }}>
            {tempValue ? tempValue : "Ninguna"}
          </Text>
        </TouchableOpacity>
        <Modal
          animationType="fade"
          transparent={true}
          visible={showDatePicker}
          onRequestClose={() => {
            setShowDatePicker(false);
          }}
        >
          <Pressable
            className="flex-1 justify-center bg-black/60 transition-all duration-300"
            onPress={() => {
              setShowDatePicker(false);
            }}
          >
            <AnimatedView className="max-h-[70%] mx-20 rounded-lg">
              <Pressable>
                <CustomCalendar onChange={pickDate} currentDate={currentDate} />
              </Pressable>
            </AnimatedView>
          </Pressable>
        </Modal>

        {/*<DateTimePickerModal
          isVisible={showDatePicker}
          date={currentDate}
          mode="date"
          onConfirm={pickDate}
          onCancel={() => setShowDatePicker(false)}
        />*/}
      </View>
    );
  };

  const [minValue, setMinValue] = useState<string>(
    tempValue?.min?.toString() || ""
  );
  const [maxValue, setMaxValue] = useState<string>(
    tempValue?.max?.toString() || ""
  );

  useEffect(() => {
    if (filter.type === "range") {
      setMinValue(tempValue?.min?.toString() || "");
      setMaxValue(tempValue?.max?.toString() || "");
    }
  }, [tempValue, filter.type]);

  useEffect(() => {
    if (filter.type === "range") {
      setTempValue({
        min: minValue ? parseInt(minValue) : undefined,
        max: maxValue ? parseInt(maxValue) : undefined,
      });
    }
  }, [minValue, maxValue, filter.type]);

  const renderRangeFilter = () => {
    return (
      <View style={styles.filterContent}>
        <View style={styles.rangeContainer}>
          <View style={styles.rangeInput}>
            <Text style={styles.rangeLabel}>Min:</Text>
            <TextInput
              style={styles.rangeTextInput}
              keyboardType="numeric"
              value={minValue}
              onChangeText={setMinValue}
              placeholder={(filter as RangeFilterOption).min?.toString() || "0"}
            />
          </View>
          <View style={styles.rangeInput}>
            <Text style={styles.rangeLabel}>Max:</Text>
            <TextInput
              style={styles.rangeTextInput}
              keyboardType="numeric"
              value={maxValue}
              onChangeText={setMaxValue}
              placeholder={
                (filter as RangeFilterOption).max?.toString() || "999+"
              }
            />
          </View>
        </View>
      </View>
    );
  };

  const renderToggleFilter = () => (
    <View style={styles.filterContent}>
      <View className="flex-row items-center justify-center">
        <ThemedSwitch
          onValueChange={() => setTempValue(!tempValue)}
          value={tempValue}
        />
      </View>
    </View>
  );

  useEffect(() => {
    if (filter.type === "toggle" && tempValue == null) {
      setTempValue(false);
    }
  }, [tempValue]);

  return (
    <View>
      <View>
        <TouchableOpacity
          onPress={() =>
            isAccordionOpen ? closeAccordion() : setAccordionOpen(filter.key)
          }
        >
          <View
            className={`flex-row items-center justify-between p-2 ${
              isAccordionOpen ? "rounded-t-lg" : "rounded-lg"
            }`}
            style={{
              backgroundColor: isAccordionOpen
                ? colors.background
                : colors.background,
              borderColor: colors.border,
              borderBottomWidth: isAccordionOpen ? 0 : 2,
              borderWidth: 2,
            }}
          >
            <Text
              className="font-semibold text-lg mx-1"
              style={{
                color: isAccordionOpen
                  ? colors.mutedForeground
                  : colors.mutedForeground,
              }}
            >
              {buttonLabel || filter.label}:{" "}
              <Text className="font-medium" style={{ color: colors.accent }}>
                {getDisplayValue()}
              </Text>
            </Text>
            <Feather
              name={`chevron-${isAccordionOpen ? "up" : "down"}`}
              size={18}
              color="#FFF"
            />
          </View>
        </TouchableOpacity>
        {isAccordionOpen && (
          <View
            className="flex border-2 rounded-b-lg "
            style={{
              borderColor: colors.border,
              backgroundColor: colors.background,
            }}
          >
            <ScrollView className="max-h-52 my-4">
              {renderFilterContent()}
            </ScrollView>
            <View
              className="flex flex-row justify-between items-center px-4 py-4"
              style={{ borderColor: colors.border, borderTopWidth: 2 }}
            >
              <TouchableOpacity
                className="border-2 text-white rounded-2xl px-5 py-2"
                style={{ borderColor: colors.accent }}
                onPress={handleClear}
              >
                <Text
                  className="font-bold text-lg"
                  style={{ color: colors.foreground }}
                >
                  Clear
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-2xl px-5 py-3"
                style={{
                  backgroundColor:
                    tempValue == null ? colors.secondary : colors.accent,
                }}
                disabled={tempValue == null}
                onPress={handleApply}
              >
                <Text
                  className={`font-bold text-lg`}
                  style={{
                    color:
                      tempValue == null
                        ? colors.muted
                        : colors.accentForeground,
                  }}
                >
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#3498db",
    borderRadius: 8,
  },
  filterButtonText: {
    color: "#FFF",
    fontWeight: "600",
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  filterListContainer: {
    maxHeight: "70%",
  },
  filterContent: {
    padding: 16,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  selectedOption: {
    backgroundColor: "#3498db",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedOptionText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
  },
  dateLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  rangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  rangeInput: {
    width: "48%",
  },
  rangeLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  rangeTextInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  toggleButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  toggleButtonActive: {
    backgroundColor: "#3498db",
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#FFF",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#999",
  },
  clearButtonText: {
    color: "#333",
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: "#3498db",
    borderRadius: 8,
  },
  applyButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default SingleFilterSelect;
