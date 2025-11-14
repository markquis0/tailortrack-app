import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TailorStackParamList } from "./types";
import TailorDashboardScreen from "../screens/tailor/TailorDashboardScreen";
import ClientProfileScreen from "../screens/tailor/ClientProfileScreen";
import TimerScreen from "../screens/tailor/TimerScreen";
import TailorAppointmentsScreen from "../screens/tailor/TailorAppointmentsScreen";

const Stack = createNativeStackNavigator<TailorStackParamList>();

const TailorNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TailorDashboard"
        component={TailorDashboardScreen}
        options={{ title: "Tailor dashboard" }}
      />
      <Stack.Screen
        name="ClientProfile"
        component={ClientProfileScreen}
        options={{ title: "Client profile" }}
      />
      <Stack.Screen name="Timer" component={TimerScreen} options={{ title: "Time tracking" }} />
      <Stack.Screen
        name="TailorAppointments"
        component={TailorAppointmentsScreen}
        options={{ title: "Appointments" }}
      />
    </Stack.Navigator>
  );
};

export default TailorNavigator;

