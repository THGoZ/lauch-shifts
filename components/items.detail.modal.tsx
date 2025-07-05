import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, View } from "react-native";

interface ModalActions {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "warning"
    | "success";
  disabled?: boolean;
}

interface ModalMetadata {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface ItemsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  actions?: ModalActions[];
  metadata?: ModalMetadata[];
  showDefaultActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ItemDetailsModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  actions,
  metadata,
  showDefaultActions = true,
  onEdit,
  onDelete,
}: ItemsDetailModalProps) {
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
  });
  const defaultActions = [];

  if (showDefaultActions) {
    if (onEdit) {
      defaultActions.push({
        label: "Editar",
        icon: (
          <Ionicons name="pencil-outline" size={16} color={colors.primary} />
        ),
        onClick: onEdit,
        variant: "outline" as const,
        disabled: false,
      });
    }
    if (onDelete) {
      defaultActions.push({
        label: "Borrar",
        icon: (
          <Ionicons name="trash-outline" size={16} color={colors.destructive} />
        ),
        onClick: onDelete,
        variant: "destructive" as const,
        disabled: false,
      });
    }
  }

  const allActions = [...(actions ?? []), ...defaultActions];

  return (
    <Modal
      visible={isOpen}
      onRequestClose={onClose}
      statusBarTranslucent={true}
      animationType="fade"
      transparent={false}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
    </Modal>
  );
}
