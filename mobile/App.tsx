import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import { AuthProvider, useAuth } from "./src/hooks/useAuth";
import AuthScreen from "./src/screens/AuthScreen";
import AppNavigator from "./src/navigation/AppNavigator";

enableScreens();

const Root: React.FC = () => {
  const { token } = useAuth();

  if (!token) {
    return (
      <>
        <AuthScreen />
        <StatusBar style="dark" />
      </>
    );
  }

  return (
    <>
      <AppNavigator />
      <StatusBar style="dark" />
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
