import { SortValue } from "@/db/domain/utils/queryHandle";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type SortDirection = "asc" | "desc";

export interface SortOption {
  field: string;
  label: string;
  order?: SortDirection;
}

export interface SortSelectProps {
  options: SortOption[];
  selectedOption?: SortValue<any> | null;
  onSelect: <T>(option: SortValue<T>) => void;
  containerStyle?: object;
  buttonStyle?: object;
  buttonTextStyle?: object;
  modalTitle?: string;
}

export const ThemedSortSelect: React.FC<SortSelectProps> = ({
  options,
  selectedOption,
  onSelect,
  modalTitle = "Sort by",
}) => {
  const colors = useThemeColors();
  const styles = StyleSheet.create({
    deleteModalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    modalHeader: {
      backgroundColor: colors.muted,
      borderBottomWidth: 2,
      borderColor: colors.border,
      borderTopEndRadius: 8,
      borderTopStartRadius: 8,
      marginBottom: 6,
    },
  });

  const [modalVisible, setModalVisible] = useState(false);
  const handleSelect = (option: SortOption) => {
    if (selectedOption && selectedOption.field === option.field) {
      const newDirection = selectedOption.order === "asc" ? "desc" : "asc";
      const newSortOption: SortValue<any> = {
        field: option.field,
        order: newDirection,
      };
      onSelect(newSortOption);
    } else {
      onSelect({ field: option.field, order: "asc" });
    }
  };

  const resetSort = () => {
    onSelect({
      field: options[0].field,
      order: options[0].order ?? "asc",
    });
    setModalVisible(false);
  };

  const renderDirectionIcon = (direction?: SortDirection) => {
    if (!direction) return null;

    return (
      <View
        className={`flex-row items-center justify-center ${
          direction === "asc" ? "rotate-180" : ""
        } transition-transform duration-300 ease-in-out`}
      >
        <MaterialCommunityIcons
          name="sort-ascending"
          size={28}
          color={colors.primary}
        />
      </View>
    );
  };

  return (
    <>
      <View className="flex-row items-center px-2 py-2 w-[10%]">
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <View
            className={`${
              selectedOption
                ? selectedOption.order === "asc"
                  ? "rotate-180"
                  : ""
                : ""
            } transition-transform duration-300 ease-in-out`}
          >
            <MaterialCommunityIcons
              name={
                selectedOption
                  ? selectedOption.order === "asc"
                    ? "sort-ascending"
                    : "sort-ascending"
                  : "sort"
              }
              size={28}
              color={colors.primary}
            />
          </View>
          {/*         <Image
          source={
            selectedOption
              ? selectedOption.order === "asc"
                ? require("@/assets/icons/svg/sort-descending.svg")
                : require("@/assets/icons/svg/sort-ascending.svg")
              : require("@/assets/icons/svg/sort.svg")
          }
          style={{ width: 30, height: 30 }}
          tintColor={"#00acae"}
          transition={{
            duration: 300,
            effect: "cross-dissolve",
            timing: "ease-in-out",
          }}
        /> */}
        </TouchableOpacity>
      </View>
      <View style={styles.deleteModalContainer}>
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
                className="flex-row justify-between items-center px-4 py-4"
                style={styles.modalHeader}
              >
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Feather name="x" size={24} color="#b23a49" />
                </TouchableOpacity>
                <Text
                  className="font-semibold text-xl"
                  style={{ color: colors.mutedForeground }}
                >
                  {modalTitle}
                </Text>
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                  onPress={resetSort}
                >
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
              <FlatList
                data={options}
                keyExtractor={(item) => item.field}
                renderItem={({ item }) => (
                  <View style={{marginVertical: 3, marginHorizontal: 8}}>
                    <TouchableOpacity
                      className={`flex-row p-3 justify-between items-center`}
                      style={{
                        borderColor: selectedOption?.field === item.field ? colors.secondary : colors.border,
                        borderWidth: 2,
                        borderRadius: 8,
                        backgroundColor: selectedOption?.field === item.field ? colors.secondary : colors.background
                      }}
                      onPress={() => handleSelect(item)}
                    >
                      <Text
                        style={{
                          color:
                            selectedOption?.field === item.field
                              ? colors.primary
                              : colors.secondaryForeground,
                        }}
                        className={`font-medium text-lg `}
                      >
                        {item.label}
                      </Text>
                      {selectedOption?.field === item.field &&
                        renderDirectionIcon(selectedOption?.order)}
                    </TouchableOpacity>
                  </View>
                )}
              />
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </>
  );
};
