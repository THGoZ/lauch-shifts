import React, { createContext, useContext } from "react";
import Toast, { ErrorToast, SuccessToast } from "react-native-toast-message";

interface ToastContextProps {
  showToast: (type: string, text1: string, text2?: string) => void;
  hideToast: () => void;
}


const toastConfig = {
  error: (props: any) => (
    <ErrorToast
      {...props}
      contentContainerStyle={{
        flexDirection: "row",
        flexWrap: "wrap",
        marginVertical: 8,
      }}
      text1Style={{ color: "#f52739" }}
      text2Style={{ color: "#c6f6ff", fontSize: 14 }}
      text2NumberOfLines={3}
      style={{
        backgroundColor: "#38968c",
        borderLeftColor: "red",
        height: 80,
        alignContent: "center",
      }}
    />
  ),
  success: (props: any) => (
    <SuccessToast
      {...props}
      contentContainerStyle={{
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 8,
      }}
      text1Style={{ color: "#94f8e9" }}
      text2Style={{ color: "#c6f6ff", fontSize: 14 }}
      text2NumberOfLines={3}
      style={{ backgroundColor: "#38968c", borderLeftColor: "#21fc5b" }}
    />
  ),
};

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const showToast = (type: string, text1: string, text2?: string) => {
    Toast.show({
      type,
      text1,
      text2,
      position: "top",
    });
  };

  const hideToast = () => {
    Toast.hide();
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast config={toastConfig} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
