import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ClientStackParamList } from "../../navigation/types";
import { useAuth } from "../../hooks/useAuth";
import api, { appointmentApi, AppointmentRecord } from "../../services/api";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";
import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";
import ListItem from "../../components/ListItem";

type Props = NativeStackScreenProps<ClientStackParamList, "ClientAppointments">;

const ClientAppointmentsScreen: React.FC<Props> = () => {
  const { token, user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const load = async () => {
    if (!token) {
      return;
    }
    // Anonymous users don't have client profiles or appointments
    if (user?.isAnonymous) {
      setAppointments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const clientResponse = await api.getClients(token);
      const normalized = Array.isArray(clientResponse) ? clientResponse[0] : clientResponse;
      if (!normalized) {
        throw new Error("Client profile not found");
      }
      const appointmentResponse = await appointmentApi.list(token, normalized.id);
      setAppointments(appointmentResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (user?.isAnonymous) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>
          Appointments are only available for registered users with client profiles. Add your name and email in Account to create a profile.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Card>
        <SectionHeader
          title="Your appointments"
          subtitle="Stay up to date with fittings and consultations."
        />
        {appointments.length === 0 ? (
          <Text style={styles.placeholder}>
            No fittings scheduled yet. Coordinate with your tailor to book one.
          </Text>
        ) : (
          appointments.map((appointment) => (
            <ListItem
              key={appointment.id}
              title={appointment.title}
              subtitle={`${new Date(appointment.date).toLocaleString()} • ${
                appointment.status
              }${appointment.location ? ` • ${appointment.location}` : ""}`}
            />
          ))
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  placeholder: {
    color: colors.muted,
    paddingVertical: spacing.sm,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
});

export default ClientAppointmentsScreen;

