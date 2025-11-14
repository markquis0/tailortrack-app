import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ClientStackParamList } from "./types";
import ClientDashboardScreen from "../screens/client/ClientDashboardScreen";
import ClientMeasurementsScreen from "../screens/client/ClientMeasurementsScreen";
import ClientMaterialsScreen from "../screens/client/ClientMaterialsScreen";
import ClientNotesScreen from "../screens/client/ClientNotesScreen";
import ClientAppointmentsScreen from "../screens/client/ClientAppointmentsScreen";

const Stack = createNativeStackNavigator<ClientStackParamList>();

const ClientNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ClientDashboard"
        component={ClientDashboardScreen}
        options={{ title: "My dashboard" }}
      />
      <Stack.Screen
        name="ClientMeasurements"
        component={ClientMeasurementsScreen}
        options={{ title: "Measurements" }}
      />
      <Stack.Screen
        name="ClientMaterials"
        component={ClientMaterialsScreen}
        options={{ title: "Material preferences" }}
      />
      <Stack.Screen
        name="ClientNotes"
        component={ClientNotesScreen}
        options={{ title: "Notes" }}
      />
      <Stack.Screen
        name="ClientAppointments"
        component={ClientAppointmentsScreen}
        options={{ title: "Appointments" }}
      />
    </Stack.Navigator>
  );
};

export default ClientNavigator;

