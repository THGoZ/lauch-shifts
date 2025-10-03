import CrudItem from "@/components/CrudItem";
import CrudList from "@/components/CrudList";
import DeleteModal from "@/components/DeleteModal";
import ItemDetailsModal from "@/components/ItemsDetailModal";
import { SortOption } from "@/components/ThemedSortSelect";
import { usePatients } from "@/context/PatientsContext";
import { useToast } from "@/context/ToastContext";
import { SortValue } from "@/db/domain/utils/queryHandle";
import { patient, Patient } from "@/db/schema";
import { CustomError } from "@/domain/entities/error-entity";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const sortOptions: SortOption[] = [
  {
    field: "name",
    label: "Name",
    order: "asc",
  },
  {
    field: "lastname",
    label: "Lastname",
    order: "asc",
  },
  {
    field: "dni",
    label: "DNI",
    order: "asc",
  },
  {
    field: "created_at",
    label: "Created",
    order: "desc",
  },
];
export default function PatientsScreen() {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 10,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 20,
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
    searchContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    searchInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.muted,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.foreground,
    },
    statsContainer: {
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    statsText: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontWeight: "500",
    },
    listContainer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    patientCard: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.foreground,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    patientHeader: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatarContainer: {
      marginRight: 16,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.primaryForeground,
    },
    patientInfo: {
      flex: 1,
    },
    patientName: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.foreground,
      marginBottom: 4,
    },
    patientDni: {
      fontSize: 14,
      color: colors.mutedForeground,
      marginBottom: 2,
    },
    patientDate: {
      fontSize: 12,
      color: colors.mutedForeground,
    },
    actionsContainer: {
      flexDirection: "row",
      gap: 8,
    },
    editButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.muted,
    },
    deleteButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: colors.muted,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
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
      marginBottom: 24,
    },
    addFirstButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    addFirstButtonText: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.primaryForeground,
    },
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Patient | null>(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [detailsItem, setDetailsItem] = useState<Patient | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [inSelectionMode, setInSelectionMode] = useState(false);
  const [sortOption, setSortOption] = useState<SortValue<typeof patient>>({
    field: sortOptions[0].field as keyof Patient,
    order: sortOptions[0].order as "asc" | "desc",
  });

  const {
    getPatients,
    patients: contextPatients,
    isLoading: patientsLoading,
    deletePatient,
  } = usePatients();
  const { showToast } = useToast();

  const loadData = async () => {
    const result = await getPatients(
      searchQuery,
      page,
      undefined,
      undefined,
      sortOption
    );
    if (!result.success) {
      showToast(
        "error",
        "There has been an error fetching patients",
        result.error.message
      );
    }
    setRefreshing(false);
  };

  useEffect(() => {
    const fetchPatients = async () => {
      await loadData();
    };

    fetchPatients();
  }, [page, reloadKey, sortOption]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      loadData();
    }, 800);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    setSearchQuery("");
    setPage(1);
    setReloadKey(reloadKey + 1);
  };

  const handleDeletePatient = (patient: Patient) => {
    setIsDeleteModalVisible(true);
    setDeleteItem(patient);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalVisible(false);
    setDeleteItem(null);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    const result = await deletePatient(deleteItem?.id as number);
    if (result.success) {
      setIsDeleteModalVisible(false);
      setDeleteItem(null);
      loadData();
    } else {
      if (result.error instanceof CustomError) {
        console.log(result.error.message);
        Alert.alert("Error", result.error.message);
      } else {
        Alert.alert("Error", "Something went wrong");
      }
    }
    setIsDeleteModalVisible(false);
    setDeleteItem(null);
    loadData();
  };

  const handleEditPatient = (patient: Patient) => {
    router.push(`/patients/${patient.id}`);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(
      contextPatients.data.map((patient) =>
        patient.id ? patient.id.toString() : ""
      )
    );
    setInSelectionMode(true);
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
    setInSelectionMode(false);
  };

  const handleViewDetails = (patient: Patient) => {
    setDetailsItem(patient);
    setIsDetailsModalVisible(true);
  };

  const handleCloseViewDetails = () => {
    setIsDetailsModalVisible(false);
    setDetailsItem(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderPatientCard = (
    item: Patient,
    isSelected: boolean,
    onSelect: (id: string) => void
  ) => (
    <CrudItem
      id={(item.id ?? "").toString()}
      isSelected={isSelected}
      onSelect={onSelect}
      onEdit={() => handleEditPatient(item as Patient)}
      onDelete={() => handleDeletePatient(item as Patient)}
      onViewDetails={() => handleViewDetails(item as Patient)}
      inSelectionMode={inSelectionMode}
      setInSelectionMode={setInSelectionMode}
    >
      <View style={styles.patientHeader}>
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {item.name.charAt(0)}
              {item.lastname.charAt(0)}
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>
            {item.name} {item.lastname}
          </Text>
          <Text style={styles.patientDni}>DNI: {item.dni}</Text>
          {item.created_at && (
            <Text style={styles.patientDate}>
              Created: {formatDate(item.created_at.toString())}
            </Text>
          )}
        </View>
      </View>
    </CrudItem>
  );

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

        <Text style={styles.headerTitle}>Patients</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/patients/create")}
        >
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={24} color={colors.primaryForeground} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <CrudList
        items={contextPatients.data}
        isLoading={patientsLoading}
        onRefresh={onRefresh}
        isRefreshing={refreshing}
        searchTerm={searchQuery}
        onSearchTermChange={setSearchQuery}
        onClearSearch={() => setSearchQuery("")}
        sortOptions={sortOptions}
        onSortChange={(sortOption) =>
          setSortOption(sortOption as SortValue<typeof patient>)
        }
        selectedSortOption={sortOption}
        selectedItems={selectedItems}
        onSelectItem={handleToggleSelect}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        renderItem={renderPatientCard}
        getItemId={(item) => (item.id ?? "").toString()}
        emptyState={{
          icon: "people-outline",
          title: "No patients found",
          description: "Try adjusting your search",
          action: () => router.push("/patients/create"),
          actionLabel: "Add patient",
          actionIcon: "add",
        }}
      ></CrudList>
      <View style={styles.modalContainer}>
        <DeleteModal
          title="Delete Patient"
          description="Are you sure you want to delete"
          itemName={deleteItem?.name + " " + deleteItem?.lastname}
          isVisible={isDeleteModalVisible}
          onDelete={handleDelete}
          onCancel={handleCancelDelete}
          item={deleteItem}
        />
      </View>
      <View style={styles.modalContainer}>
        {detailsItem && (
          <ItemDetailsModal
            title="Patient Details"
            subtitle="View Patient Details"
            isOpen={isDetailsModalVisible}
            onClose={handleCloseViewDetails}
            onEdit={() => handleEditPatient(detailsItem)}
            onDelete={() => handleDeletePatient(detailsItem)}
            metadata={[
              {
                label: "Name",
                value: detailsItem.name + " " + detailsItem.lastname,
              },
              {
                label: "DNI",
                value: detailsItem.dni,
              },
              {
                label: "Created",
                value: formatDate(
                  detailsItem?.created_at
                    ? detailsItem.created_at.toString()
                    : ""
                ),
              },
            ]}
            showDefaultActions={true}
            actions={[
              {
                label: "View schedule",
                onPress: () => {
                  router.push(`/shifts?id=${detailsItem.id}`);
                  setIsDeleteModalVisible(false);
                  setIsDetailsModalVisible(false);
                },
                variant: "secondary",
                icon: "calendar-outline",
              }
            ]}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
