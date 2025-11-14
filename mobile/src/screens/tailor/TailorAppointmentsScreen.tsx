import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TailorStackParamList } from "../../navigation/types";
import { useAuth } from "../../hooks/useAuth";
import { appointmentApi, AppointmentRecord } from "../../services/api";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";
import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";
import ListItem from "../../components/ListItem";

type Props = NativeStackScreenProps<TailorStackParamList, "TailorAppointments">;

const TailorAppointmentsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { token } = useAuth();
  const clientId = route.params?.clientId;
  const clientName = route.params?.clientName;
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    navigation.setOptions({
      title: clientName ? `${clientName} • Appointments` : "Appointments",
    });
  }, [clientName, navigation]);

  const loadAppointments = async () => {
    if (!token || !clientId) {
      return;
    }
    setLoading(true);
    try {
      const response = await appointmentApi.list(token, clientId);
      setAppointments(response);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [clientId]);

  const createAppointment = async () => {
    if (!token || !clientId || !title || !date) {
      return;
    }
    setLoading(true);
    try {
      await appointmentApi.create(token, {
        clientId,
        title,
        date: new Date(date),
        location: location || undefined,
        notes: notes || undefined,
      });
      setTitle("");
      setDate("");
      setLocation("");
      setNotes("");
      await loadAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to schedule appointment");
      setLoading(false);
    }
  };

  const updateStatus = async (
    appointmentId: string,
    status: "scheduled" | "completed" | "canceled"
  ) => {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      await appointmentApi.update(token, appointmentId, { status });
      await loadAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update appointment");
      setLoading(false);
    }
  };

  if (!clientId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.placeholder}>
          Select a client from the dashboard to manage appointments.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Card>
        <SectionHeader
          title="Schedule a fitting"
          subtitle="Pick a date, add notes, and share updates with your client."
        />
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Final fitting, measurements, consultation..."
          value={title}
          onChangeText={setTitle}
        />
        <Text style={styles.label}>Date & time (ISO format)</Text>
        <TextInput
          style={styles.input}
          placeholder="2025-12-31T14:00"
          value={date}
          onChangeText={setDate}
        />
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="123 Main St, Atelier"
          value={location}
          onChangeText={setLocation}
        />
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Special fit requests, outfit goals..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />
        <View style={styles.buttonRow}>
          <Button
            title="Schedule appointment"
            onPress={createAppointment}
            disabled={loading}
          />
        </View>
      </Card>

      <Card>
        <SectionHeader
          title="Upcoming & past appointments"
          subtitle="Tap to update status as fittings are completed."
        />
        {loading && appointments.length === 0 ? (
          <ActivityIndicator color={colors.primary} />
        ) : appointments.length === 0 ? (
          <Text style={styles.placeholder}>No fittings scheduled yet.</Text>
        ) : (
          appointments.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentRow}>
              <ListItem
                title={`${appointment.title} • ${appointment.status}`}
                subtitle={`${new Date(appointment.date).toLocaleString()}${
                  appointment.location ? ` • ${appointment.location}` : ""
                }`}
              />
              <View style={styles.actions}>
                <Button
                  title="Done"
                  onPress={() => updateStatus(appointment.id, "completed")}
                  disabled={loading}
                />
                <Button
                  title="Cancel"
                  onPress={() => updateStatus(appointment.id, "canceled")}
                  color={colors.warning}
                  disabled={loading}
                />
              </View>
            </View>
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
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  label: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.muted,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.sm,
    marginTop: spacing.xs,
    backgroundColor: colors.surface,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonRow: {
    marginTop: spacing.md,
  },
  appointmentRow: {
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
});

export default TailorAppointmentsScreen;

