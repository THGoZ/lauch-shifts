import { useThemeColors } from "@/hooks/useThemeColors";
import { Modal, StyleSheet, Text, View } from "react-native";
import ThemedButton from "./ThemedButton";

interface DeleteModalProps {
  onDelete: (item: any) => void;
  onCancel: () => void;
  item: any;
  isVisible: boolean;
  title?: string;
  description?: string;
  itemName?: string;
  isLoading?: boolean;
}

const DeleteModal = ({
  onDelete,
  onCancel,
  isVisible,
  item,
  title = "Delete",
  description = "You are about to delete this",
  itemName = "Item",
  isLoading,
}: DeleteModalProps) => {
  const colors = useThemeColors();
  const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalView: {
      width: "80%",
      padding: 20,
      backgroundColor: colors.background,
      borderRadius: 10,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      gap: 10,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.foreground,
    },
    subtitleContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    subtitle: {
      fontSize: 16,
      color: colors.mutedForeground,
      marginBottom: 12,
    },
    itemName: {
      fontSize: 16,
      color: colors.foreground,
      marginBottom: 12,
    },
    buttonRow: {
      marginTop: 10,
      flexDirection: "row",
      justifyContent: "space-between",
    },
  });

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>
              {description}{" "}
            </Text>
            <Text style={styles.itemName}>{itemName}</Text>
            <Text style={styles.subtitle}>{" "}?</Text>
          </View>
          <View style={styles.buttonRow}>
            <ThemedButton
              onPress={onCancel}
              variant="outline"
              title="Cancel"
              leftIcon="close-sharp"
              loading={isLoading}
              disabled={isLoading}
            />
            <ThemedButton
              onPress={() => onDelete(item)}
              variant="destructive"
              leftIcon="trash-outline"
              title="Delete"
              disabled={isLoading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteModal;
