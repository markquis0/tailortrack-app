import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TailorStackParamList } from "../../navigation/types";
import { useAuth } from "../../hooks/useAuth";
import api, { ClientSummary, MeasurementRecord } from "../../services/api";
import { appointmentApi, timerApi, AppointmentRecord, TimerRecord } from "../../services/api";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";
import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";
import ListItem from "../../components/ListItem";

type Props = NativeStackScreenProps<TailorStackParamList, "ClientProfile">;

const measurementLabels: Record<keyof Omit<MeasurementRecord, "clientId" | "userId" | "dateTaken">, string> = {
  chest: "Chest",
  overarm: "Overarm",
  waist: "Waist",
  hipSeat: "Hip / Seat",
  neck: "Neck",
  arm: "Arm",
  pantOutseam: "Pant Outseam",
  pantInseam: "Pant Inseam",
  coatInseam: "Coat Inseam",
  height: "Height",
  weight: "Weight",
  coatSize: "Coat Size",
  pantSize: "Pant Size",
  dressShirtSize: "Dress Shirt Size",
  shoeSize: "Shoe Size",
  materialPreference: "Material Preference",
};

const ClientProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { token } = useAuth();
  const { clientId, clientName } = route.params;
  const [client, setClient] = useState<ClientSummary | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementRecord | null>(null);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [timers, setTimers] = useState<TimerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    navigation.setOptions({
      title: clientName ?? "Client profile",
    });
  }, [clientName, navigation]);

  const loadData = async () => {
    if (!token) {
      return;
    }

    setError(undefined);
    setLoading(true);
    try {
      const [clientResponse, measurementResponse, appointmentsResponse, timersResponse] =
        await Promise.all([
          api.getClient(token, clientId),
          api.getMeasurements(token, clientId).catch(() => null),
          appointmentApi.list(token, clientId).catch(() => []),
          timerApi.list(token, clientId).catch(() => []),
        ]);

      setClient(clientResponse);
      setMeasurements(measurementResponse);
      setAppointments(appointmentsResponse);
      setTimers(timersResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load client");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [clientId]);

  const sortedTimers = useMemo(
    () =>
      [...timers].sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      ),
    [timers]
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading client profile...</Text>
      </View>
    );
  }

  if (!client) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error ?? "Client could not be found."}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Card>
        <SectionHeader title="Profile" subtitle="Client details and preferences." />
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{client.clientUser?.name ?? "Pending invite"}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{client.clientUser?.email ?? "Not available"}</Text>
        <Text style={styles.label}>Store / Boutique</Text>
        <Text style={styles.value}>{client.storeName ?? "—"}</Text>
        <Text style={styles.label}>Notes</Text>
        <Text style={styles.value}>{client.notes ?? "Add fitting notes for this client."}</Text>
      </Card>

      <Card>
        <SectionHeader
          title="Measurements"
          subtitle="Last recorded measurements and sizes."
        />
        {measurements ? (
          Object.entries(measurementLabels).map(([key, label]) => {
            const typedKey = key as keyof typeof measurementLabels;
            const value = measurements[typedKey];
            if (!value) {
              return null;
            }
            return (
              <View key={key} style={styles.measurementRow}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}</Text>
              </View>
            );
          })
        ) : (
          <Text style={styles.placeholder}>
            Measurements haven&apos;t been captured yet for this client.
          </Text>
        )}
      </Card>

      <Card>
        <SectionHeader
          title="Upcoming Appointments"
          subtitle="Review scheduled fittings and sessions."
        />
        {appointments.length === 0 ? (
          <Text style={styles.placeholder}>
            No appointments scheduled. Tap to create one from the Tailor tab.
          </Text>
        ) : (
          appointments.map((appointment) => (
            <ListItem
              key={appointment.id}
              title={appointment.title}
              subtitle={`${new Date(appointment.date).toLocaleString()} • ${
                appointment.status
              }`}
              onPress={() =>
                navigation.navigate("TailorAppointments", {
                  clientId,
                  clientName: client.clientUser?.name,
                })
              }
            />
          ))
        )}
      </Card>

      <Card>
        <SectionHeader
          title="Time Tracking"
          subtitle="Recent sessions logged for this client."
        />
        {sortedTimers.length === 0 ? (
          <Text style={styles.placeholder}>
            No time tracked yet. Start a timer to log sourcing or fittings.
          </Text>
        ) : (
          sortedTimers.slice(0, 5).map((timer) => (
            <ListItem
              key={timer.id}
              title={
                timer.duration ? `${timer.duration} min` : "Timer in progress"
              }
              subtitle={`${new Date(timer.startTime).toLocaleString()}${
                timer.description ? ` • ${timer.description}` : ""
              }`}
              onPress={() =>
                navigation.navigate("Timer", {
                  clientId,
                  clientName: client.clientUser?.name,
                })
              }
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
    paddingBottom: spacing.xl,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.muted,
  },
  label: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    marginTop: spacing.xs,
  },
  placeholder: {
    color: colors.muted,
    paddingVertical: spacing.sm,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  measurementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
});

export default ClientProfileScreen;

