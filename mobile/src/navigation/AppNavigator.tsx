import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { RootTabParamList } from "./types";
import TailorNavigator from "./TailorNavigator";
import ClientNavigator from "./ClientNavigator";
import AccountScreen from "../screens/AccountScreen";
import { useAuth } from "../hooks/useAuth";

const Tab = createBottomTabNavigator<RootTabParamList>();

const AppNavigator: React.FC = () => {
  const { user } = useAuth();
  const isTailor = user?.role === "tailor";

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        {isTailor ? (
          <Tab.Screen name="Tailor" component={TailorNavigator} />
        ) : null}
        <Tab.Screen
          name="Client"
          component={ClientNavigator}
          options={{ title: isTailor ? "Client view" : "Home" }}
        />
        <Tab.Screen name="Account" component={AccountScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

