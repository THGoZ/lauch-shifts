import { useThemeColors } from "@/hooks/useThemeColors";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SingleFilterSelect, { FilterOption } from "./ThemedSingleFilterSelect";

export interface FilterValues {
  [key: string]: any;
}

interface FiltersContainerProps {
  filters: FilterOption[];
  onFiltersChange?: (filters: FilterValues) => void;
  containerStyle?: object;
  buttonStyle?: object;
  buttonTextStyle?: object;
}

const FiltersContainer: React.FC<FiltersContainerProps> = ({
  filters,
  onFiltersChange,
  containerStyle,
  buttonStyle,
  buttonTextStyle,
}) => {
  const colors = useThemeColors();
  const styles = StyleSheet.create({});
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAccordion, setCurrentAccordion] = useState<string | null>(null);

  const handleFilterChange = (key: string, value: any) => {
    const updatedFilters = {
      ...filterValues,
      [key]: value,
    };

    if (
      value === null ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === "object" &&
        value !== null &&
        Object.values(value).every((v) => v === undefined))
    ) {
      delete updatedFilters[key];
    }

    setFilterValues(updatedFilters);

    if (onFiltersChange) {
      onFiltersChange(updatedFilters);
    }
  };

  const handleAccordionChange = (key?: string) => {
    setCurrentAccordion(key ?? null);
  };

  const resetFilters = () => {
    setFilterValues({});
    if (onFiltersChange) {
      onFiltersChange({});
    }
  };

  useEffect(() => {
    if (modalVisible) {
      setCurrentAccordion(null);
    }
  }, [modalVisible]);

  return (
    <View className="flex-row items-center px-2 py-2 w-[10%]">
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Image
          source={require("@/assets/icons/svg/filter-outline.svg")}
          style={{ width: 30, height: 30 }}
          tintColor={colors.primary}
          transition={{
            duration: 300,
            effect: "cross-dissolve",
            timing: "ease-in-out",
          }}
        ></Image>

        {Object.keys(filterValues).length > 0 && (
          <View
            className="absolute w-5 h-5 ml-1 left-3 top-3 flex items-center justify-center z-50 rounded-full"
            style={{ backgroundColor: colors.muted }}
          >
            <Text className="text-white text-sm">
              {Object.keys(filterValues).length}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end my-2"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            className="max-h-[70%] rounded-t-lg"
            style={{ backgroundColor: colors.muted }}
          >
            <View
              style={{
                borderColor: colors.border,
              }}
              className="flex-row justify-between items-center px-4 py-4 border-b-2 mb-2"
            >
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#b23a49" />
              </TouchableOpacity>
              <Text
                className="font-semibold text-xl"
                style={{ color: colors.mutedForeground }}
              >
                Filter
              </Text>
              <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 8 }} onPress={resetFilters}>
                <Feather
                  name="refresh-cw"
                  size={12}
                  color={colors.secondaryForeground}
                />
                <Text
                  className="text-base"
                  style={{ color: colors.secondaryForeground }}
                >
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView className="mb-2" showsVerticalScrollIndicator={false}>
              {filters.map((filter) => (
                <View key={filter.key} className="m-1">
                  <SingleFilterSelect
                    filter={filter}
                    value={filterValues[filter.key]}
                    onChange={(value) => handleFilterChange(filter.key, value)}
                    isAccordionOpen={currentAccordion === filter.key}
                    setAccordionOpen={() => handleAccordionChange(filter.key)}
                    closeAccordion={() => handleAccordionChange()}
                    buttonStyle={buttonStyle}
                    buttonTextStyle={buttonTextStyle}
                  />
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default FiltersContainer;
