import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { ClientStackParamList } from "../../navigation/types";
import { useAuth } from "../../hooks/useAuth";
import api, { ClientSummary, MeasurementRecord } from "../../services/api";
import { appointmentApi } from "../../services/api";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";
import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";
import ListItem from "../../components/ListItem";

type Props = NativeStackScreenProps<ClientStackParamList, "ClientDashboard">;

const ClientDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { token, user } = useAuth();
  const [client, setClient] = useState<ClientSummary | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    { title: string; date: string; id: string }[]
  >([]);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }
    // Wait for user to be loaded before proceeding
    if (user === undefined) {
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      // For anonymous users, skip client profile and load measurements directly
      if (user?.isAnonymous) {
        const measurementResponse = await api
          .getMeasurements(token)
          .catch(() => null);
        setMeasurements(measurementResponse);
        setClient(null); // Anonymous users don't have a client profile
      } else {
        // For authenticated users with client profiles
        const response = await api.getClients(token);
        const normalized = Array.isArray(response) ? response[0] : response;
        setClient(normalized ?? null);
        if (normalized) {
          const measurementResponse = await api
            .getMeasurements(token, normalized.id)
            .catch(() => null);
          setMeasurements(measurementResponse);
          const appointmentResponse = await appointmentApi
            .list(token, normalized.id)
            .catch(() => []);
          setUpcomingAppointments(
            appointmentResponse
              .filter((appointment) => new Date(appointment.date) >= new Date())
              .slice(0, 3)
              .map((appointment) => ({
                id: appointment.id,
                title: appointment.title,
                date: appointment.date,
              }))
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const formatHeight = (value?: number) => {
    if (value === undefined || value === null) {
      return "—";
    }
    const totalInches = Math.max(0, Math.round(value));
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}' ${inches}''`;
  };

  // Show loading if we're waiting for user to be loaded or if we're actively loading data
  if (user === undefined || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.placeholder}>Loading your dashboard...</Text>
      </View>
    );
  }

  // For anonymous users, show dashboard without client profile
  if (!user?.isAnonymous && !client) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>
          {error ?? "We couldn&apos;t find your profile. Ask your tailor to share it."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Card>
        <SectionHeader
          title="Welcome to TailorTrack!"
          subtitle={
            user?.isAnonymous
              ? "Track your measurements and preferences. Add your name and email in Account to personalize your profile."
              : "Review measurements, notes, and upcoming fittings."
          }
        />
        {!user?.isAnonymous && client && (
          <>
            <Text style={styles.label}>Tailor</Text>
            <Text style={styles.value}>
              {client.notes ? "Assigned tailor • see notes below" : "No tailor connected yet"}
            </Text>
            <Text style={styles.label}>Store focus</Text>
            <Text style={styles.value}>{client.storeName ?? "Add your preferred stores."}</Text>
          </>
        )}
      </Card>

      {!user?.isAnonymous && (
        <Card>
          <SectionHeader
            title="Upcoming appointments"
            subtitle="Fittings and sessions scheduled with your tailor."
          />
          {upcomingAppointments.length === 0 ? (
            <Text style={styles.placeholder}>No fittings planned. Schedule one with your tailor.</Text>
          ) : (
            upcomingAppointments.map((appointment) => (
              <ListItem
                key={appointment.id}
                title={appointment.title}
                subtitle={new Date(appointment.date).toLocaleString()}
                onPress={() => navigation.navigate("ClientAppointments")}
              />
            ))
          )}
        </Card>
      )}

      <Card>
        <SectionHeader
          title="Quick measurements"
          subtitle="Keep your measurements up to date for custom fits."
        />
        {measurements ? (
          <View>
            <View style={styles.measurementsGrid}>
              <View style={styles.measurementItem}>
                <Text style={styles.measurementLabel}>Chest</Text>
                <Text style={styles.measurementValue}>{measurements.chest ?? "—"}</Text>
              </View>
              <View style={styles.measurementItem}>
                <Text style={styles.measurementLabel}>Overarm</Text>
                <Text style={styles.measurementValue}>{measurements.overarm ?? "—"}</Text>
              </View>
              <View style={styles.measurementItem}>
                <Text style={styles.measurementLabel}>Waist</Text>
                <Text style={styles.measurementValue}>{measurements.waist ?? "—"}</Text>
              </View>
              <View style={styles.measurementItem}>
                <Text style={styles.measurementLabel}>Hip/Seat</Text>
                <Text style={styles.measurementValue}>{measurements.hipSeat ?? "—"}</Text>
              </View>
              <View style={styles.measurementItem}>
                <Text style={styles.measurementLabel}>Neck</Text>
                <Text style={styles.measurementValue}>{measurements.neck ?? "—"}</Text>
              </View>
              <View style={styles.measurementItem}>
                <Text style={styles.measurementLabel}>Arm</Text>
                <Text style={styles.measurementValue}>{measurements.arm ?? "—"}</Text>
              </View>
              <View style={styles.measurementItem}>
                <Text style={styles.measurementLabel}>Pant Outseam</Text>
                <Text style={styles.measurementValue}>{measurements.pantOutseam ?? "—"}</Text>
              </View>
              <View style={styles.measurementItem}>
                <Text style={styles.measurementLabel}>Pant Inseam</Text>
                <Text style={styles.measurementValue}>{measurements.pantInseam ?? "—"}</Text>
              </View>
              <View style={styles.measurementItem}>
                <Text style={styles.measurementLabel}>Coat Inseam</Text>
                <Text style={styles.measurementValue}>{measurements.coatInseam ?? "—"}</Text>
              </View>
              <View style={styles.measurementItem}>
                <Text style={styles.measurementLabel}>Height</Text>
                <Text style={styles.measurementValue}>{formatHeight(measurements.height)}</Text>
              </View>
              <View style={styles.measurementItem}>
                <Text style={styles.measurementLabel}>Weight</Text>
                <Text style={styles.measurementValue}>{measurements.weight ?? "—"}</Text>
              </View>
            </View>
            <View style={styles.sizesSection}>
              <Text style={styles.sectionTitle}>Sizes</Text>
              <View style={styles.measurementsGrid}>
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Coat Size</Text>
                  <Text style={styles.measurementValue}>{measurements.coatSize ?? "—"}</Text>
                </View>
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Pant Size</Text>
                  <Text style={styles.measurementValue}>{measurements.pantSize ?? "—"}</Text>
                </View>
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Dress Shirt</Text>
                  <Text style={styles.measurementValue}>{measurements.dressShirtSize ?? "—"}</Text>
                </View>
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Shoe Size</Text>
                  <Text style={styles.measurementValue}>{measurements.shoeSize ?? "—"}</Text>
                </View>
              </View>
            </View>
            {measurements.materialPreference && (
              <View style={styles.preferenceSection}>
                <Text style={styles.sectionTitle}>Material Preference</Text>
                <Text style={styles.preferenceValue}>{measurements.materialPreference}</Text>
              </View>
            )}
            <Text style={styles.link} onPress={() => navigation.navigate("ClientMeasurements")}>
              Update measurements
            </Text>
          </View>
        ) : (
          <Text style={styles.placeholder}>
            Measurements haven&apos;t been added yet. Update them to get tailored guidance.
          </Text>
        )}
      </Card>

      {!user?.isAnonymous && client && (
        <Card>
          <SectionHeader title="Notes" subtitle="Personal reminders for fit and style." />
          <Text style={styles.value}>{client.notes ?? "Add fit notes or reminders."}</Text>
          <Text style={styles.link} onPress={() => navigation.navigate("ClientNotes")}>
            Edit notes
          </Text>
        </Card>
      )}
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  placeholder: {
    marginTop: spacing.sm,
    color: colors.muted,
    textAlign: "center",
  },
  error: {
    color: colors.danger,
    textAlign: "center",
  },
  label: {
    marginTop: spacing.sm,
    color: colors.muted,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  value: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 16,
  },
  measurementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.sm,
    marginHorizontal: -spacing.xs,
  },
  measurementItem: {
    width: "47%",
    marginBottom: spacing.md,
    marginHorizontal: spacing.xs,
  },
  measurementLabel: {
    fontSize: 12,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  measurementValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
  sizesSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  preferenceSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  preferenceValue: {
    fontSize: 16,
    color: colors.text,
    marginTop: spacing.xs,
  },
  link: {
    marginTop: spacing.md,
    color: colors.primary,
    fontWeight: "600",
  },
});

export default ClientDashboardScreen;

