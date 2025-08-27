import { useThemeColors } from "@/hooks/useThemeColors";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import ThemedButton from "./ThemedButton";

interface ThemedBasicModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function ThemedBasicModal({
  isOpen,
  onClose,
  title,
  children,
}: ThemedBasicModalProps) {
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
        }
    });

  return (
    <Modal
      visible={isOpen}
      onRequestClose={onClose}
      statusBarTranslucent={true}
      animationType="fade"
      transparent={true}
    >
      <Pressable
        style={{ flex: 1}}
        onPress={() => {
          onClose();
        }}
      >
        <Pressable style={styles.centeredView}>
          <View style={styles.modalView}>
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
            {children}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}