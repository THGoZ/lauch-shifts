import { SortValue } from "@/db/domain/utils/queryHandle";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AnimatedView from "./AnimatedView";
import BulkActions from "./BulkActions";
import FiltersContainer, { FilterValues } from "./FiltersContainer";
import ThemedSearchBar from "./ThemedSearchBar";
import { FilterOption } from "./ThemedSingleFilterSelect";
import { SortOption, ThemedSortSelect } from "./ThemedSortSelect";

interface CrudListProps<T> {
  items: T[];
  isLoading: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  searchTerm?: string;
  onSearchTermChange?: (searchTerm: string) => void;
  onClearSearch?: () => void;
  filters?: FilterOption[];
  onFilterChange?: (filters: FilterValues) => void;
  sortOptions?: SortOption[];
  onSortChange?: <T>(sortOption: SortValue<T>) => void;
  selectedSortOption?: SortValue<any>;
  selectedItems: string[];
  onSelectItem?: (itemId: string) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  renderItem: (
    item: T,
    isSelected: boolean,
    onSelect: (id: string) => void,
    onEdit?: () => void,
    onDelete?: () => void,
    onViewDetails?: () => void
  ) => React.ReactElement | null;
  getItemId: (item: T) => string;
  emptyState?: {
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    action?: () => void;
    actionLabel?: string;
    actionIcon?: keyof typeof Ionicons.glyphMap;
  };
  totalItems?: number;
  page?: number;
  totalPages?: number;
  pagesize?: number;
  setPage?: (page: number) => void;
}

export default function CrudList<T>({
  items,
  isLoading,
  searchTerm,
  onRefresh,
  isRefreshing,
  onSearchTermChange,
  onClearSearch,
  filters,
  onFilterChange,
  sortOptions,
  onSortChange,
  selectedSortOption,
  selectedItems,
  onSelectItem,
  onSelectAll,
  onClearSelection,
  renderItem,
  getItemId,
  emptyState,
}: CrudListProps<T>) {
  const colors = useThemeColors();
  const styles = StyleSheet.create({
    headerContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      marginTop: 10,
      gap: 8,
    },
    filterAndSearchContainer: {
      flex: 1,
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      gap: 8,
    },
    selecItemsContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      marginHorizontal: 9,
      marginBottom: 5,
      marginTop: 9,
    },
    checkboxContainer: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primary,
    },
    checkboxText: {
      fontSize: 16,
      color: colors.primary,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 30,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.foreground,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 16,
      color: colors.mutedForeground,
      textAlign: "center",
    },
    addFirstButton: {
      marginHorizontal: "auto",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
    },
    addFirstButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primaryForeground,
    },
  });
  return (
    <FlatList
      data={items}
      renderItem={({ item }) => {
        const itemId = getItemId(item);
        return (
          <View>
            {renderItem(
              item,
              selectedItems?.includes(itemId) ?? false,
              () => onSelectItem?.(itemId),
              () => {},
              () => {},
              () => {}
            )}
          </View>
        );
      }}
      keyExtractor={(item, index) => {
        return index.toString();
      }}
      ListHeaderComponent={
        <View style={styles.headerContainer}>
          <View style={styles.filterAndSearchContainer}>
            <ThemedSearchBar
              placeholder="Search..."
              value={searchTerm}
              onSearchTermChange={onSearchTermChange}
              onClear={onClearSearch}
            />
            {sortOptions && (
              <ThemedSortSelect
                options={sortOptions}
                selectedOption={selectedSortOption}
                onSelect={(option) => {
                  onSortChange?.(option);
                }}
              />
            )}
            {filters && (
              <FiltersContainer
                filters={filters}
                onFiltersChange={onFilterChange}
              />
            )}
          </View>
          {items.length > 0 && (
            <>
              <BulkActions
                selectedCount={selectedItems.length}
                onClearSelection={onClearSelection ?? (() => {})}
                onBulkDelete={() => {}}
              />
              <TouchableOpacity
                onPress={
                  selectedItems?.length === items.length && items.length > 0
                    ? onClearSelection
                    : onSelectAll
                }
                style={styles.selecItemsContainer}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <View style={styles.checkboxContainer}>
                    {selectedItems?.length === items.length &&
                      items.length > 0 && (
                        <Ionicons
                          name="checkmark"
                          size={24}
                          color={colors.primary}
                        />
                      )}
                  </View>
                  <Text style={styles.checkboxText}>
                    {selectedItems.length === items.length && items.length > 0
                      ? "Deselect all"
                      : "Select all"}
                  </Text>
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      ListEmptyComponent={
        isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <AnimatedView>
            <View style={styles.emptyState}>
              <Ionicons
                name={emptyState?.icon ?? "document"}
                size={64}
                color={colors.mutedForeground}
              />
              <Text style={styles.emptyTitle}>
                {emptyState?.title ?? "No items found"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {emptyState?.description
                  ? emptyState.description
                  : "Try adjusting your search"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={emptyState?.action ?? (() => {})}
            >
              <Ionicons
                name={emptyState?.actionIcon ?? "refresh"}
                size={24}
                color={colors.primaryForeground}
              />
              <Text style={styles.addFirstButtonText}>
                {emptyState?.actionLabel ?? "Refresh"}
              </Text>
            </TouchableOpacity>
          </AnimatedView>
        )
      }
    ></FlatList>
  );
}
