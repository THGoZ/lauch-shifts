import { useThemeColors } from "@/hooks/useThemeColors";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import ThemedButton from "./ThemedButton";

export interface ModalActions {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
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
  loading?: boolean;
}

interface ModalMetadata {
  label: string;
  value: string | React.ReactNode;
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
      width: "95%",
      backgroundColor: colors.background,
      borderRadius: 10,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      gap: 10,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 5,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      padding: 10,
    },
    closeButton: {},
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.foreground,
    },
    subtitle: {
      marginHorizontal: 10,
      marginVertical: 5,
      fontSize: 16,
      fontWeight: "bold",
      color: colors.secondaryMutedForeground,
    },
    modalContent: {
      paddingHorizontal: 20,
      paddingBottom: 15,
    },
    metadataContainer: {
      gap: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
    },
    metadataItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    metadataLabel: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.mutedForeground,
    },
    metadataValue: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.foreground,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 10,
    },
    actionsContainer: {
      flexDirection: "row",
      alignItems: "center",
      alignContent: "center",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 8,
    },
  });
  const defaultActions: ModalActions[] = [];

  if (showDefaultActions) {
    if (onEdit) {
      defaultActions.push({
        label: "Editar",
        icon: "pencil-outline",
        onPress: () => {
          onEdit();
          onClose();
        },
        variant: "outline" as const,
        disabled: false,
      });
    }
    if (onDelete) {
      defaultActions.push({
        label: "Borrar",
        icon: "trash-outline",
        onPress: () => {
          onDelete();
          onClose();
        },
        variant: "destructive" as const,
        disabled: false,
      });
    }
  }

  const allActions = [...defaultActions, ...(actions ?? [])];

  return (
    <Modal
      visible={isOpen}
      onRequestClose={onClose}
      statusBarTranslucent={true}
      animationType="fade"
      transparent={true}
    >
      <View
        style={{ flex: 1 }}
      >
        <Pressable style={styles.centeredView} onPress={() => onClose()}>
          <Pressable style={styles.modalView} onPress={() => {}}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <View style={styles.closeButton}>
                <ThemedButton
                  onPress={onClose}
                  variant="secondary"
                  title="Close"
                  size="small"
                  rounded={true}
                  leftIcon="close-sharp"
                  iconOnly={true}
                  loading={false}
                  disabled={false}
                />
              </View>
            </View>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <View style={styles.modalContent}>
              {metadata && (
                <View style={styles.metadataContainer}>
                  {metadata.map((item, index) => (
                    <View key={index} style={styles.metadataItem}>
                      {item.icon && item.icon}
                      <Text style={styles.metadataLabel}>{item.label}:</Text>
                      {typeof item.value === "string" ? (
                        <Text style={styles.metadataValue}>{item.value}</Text>
                      ) : (
                        item.value
                      )}
                    </View>
                  ))}
                </View>
              )}
              {children && (
                <>
                  <View style={styles.separator} />
                  {children}
                </>
              )}
              {allActions.length > 0 && (
                <>
                  <View style={styles.separator} />
                  <View style={styles.actionsContainer}>
                    {allActions.map((action, index) => (
                      <ThemedButton
                        key={index}
                        variant={action.variant}
                        title={action.label}
                        onPress={action.onPress}
                        leftIcon={action.icon}
                        disabled={action.disabled}
                        loading={action.loading}
                        size="small"
                        rounded={true}
                      />
                    ))}
                  </View>
                </>
              )}
            </View>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
}
