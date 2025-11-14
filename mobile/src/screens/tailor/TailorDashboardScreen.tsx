import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { TailorStackParamList } from "../../navigation/types";
import { useAuth } from "../../hooks/useAuth";
import api, { ClientSummary } from "../../services/api";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";
import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";
import ListItem from "../../components/ListItem";

type Props = NativeStackScreenProps<TailorStackParamList, "TailorDashboard">;

const TailorDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { token } = useAuth();
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const loadClients = useCallback(async () => {
    if (!token) {
      return;
    }

    setError(undefined);
    setLoading(true);
    try {
      const response = await api.getClients(token);
      const normalized = Array.isArray(response) ? response : [response];
      setClients(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useFocusEffect(
    useCallback(() => {
      loadClients();
    }, [loadClients])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadClients();
    setRefreshing(false);
  };

  const upcomingAppointments = useMemo(
    () =>
      clients
        .filter((client) => client.nextAppointment)
        .sort((a, b) => {
          if (!a.nextAppointment || !b.nextAppointment) {
            return 0;
          }
          return (
            new Date(a.nextAppointment.date).getTime() -
            new Date(b.nextAppointment.date).getTime()
          );
        })
        .slice(0, 3),
    [clients]
  );

  const recentUpdates = useMemo(
    () =>
      clients
        .filter((client) => client.lastMeasurementUpdate)
        .sort((a, b) => {
          if (!a.lastMeasurementUpdate || !b.lastMeasurementUpdate) {
            return 0;
          }
          return (
            new Date(b.lastMeasurementUpdate).getTime() -
            new Date(a.lastMeasurementUpdate).getTime()
          );
        })
        .slice(0, 3),
    [clients]
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your clients...</Text>
        </View>
      ) : (
        <>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <FlatList
            data={clients}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            ListHeaderComponent={
              <View>
                <SectionHeader
                  title="Overview"
                  subtitle="Track client progress, notes, and appointments at a glance."
                />
                <View style={styles.metricsRow}>
                  <Card padding="lg">
                    <Text style={styles.metricLabel}>Active Clients</Text>
                    <Text style={styles.metricValue}>{clients.length}</Text>
                  </Card>
                  <Card padding="lg">
                    <Text style={styles.metricLabel}>Upcoming fittings</Text>
                    <Text style={styles.metricValue}>{upcomingAppointments.length}</Text>
                  </Card>
                </View>

                <Card>
                  <SectionHeader
                    title="Upcoming Appointments"
                    subtitle="Stay ahead of fittings and consultations."
                  />
                  {upcomingAppointments.length === 0 ? (
                    <Text style={styles.placeholder}>No upcoming appointments yet.</Text>
                  ) : (
                    upcomingAppointments.map((client) => (
                      <ListItem
                        key={client.id}
                        title={client.clientUser?.name ?? "Unassigned client"}
                        subtitle={
                          client.nextAppointment
                            ? new Date(client.nextAppointment.date).toLocaleString()
                            : undefined
                        }
                        onPress={() =>
                          navigation.navigate("TailorAppointments", {
                            clientId: client.id,
                            clientName: client.clientUser?.name,
                          })
                        }
                      />
                    ))
                  )}
                </Card>

                <Card>
                  <SectionHeader
                    title="Recent Measurement Updates"
                    subtitle="Latest changes submitted by you or your clients."
                  />
                  {recentUpdates.length === 0 ? (
                    <Text style={styles.placeholder}>
                      Measurements haven&apos;t been updated recently.
                    </Text>
                  ) : (
                    recentUpdates.map((client) => (
                      <ListItem
                        key={client.id}
                        title={client.clientUser?.name ?? "Unassigned client"}
                        subtitle={
                          client.lastMeasurementUpdate
                            ? `Updated ${new Date(
                                client.lastMeasurementUpdate
                              ).toLocaleDateString()}`
                            : undefined
                        }
                        onPress={() =>
                          navigation.navigate("ClientProfile", {
                            clientId: client.id,
                            clientName: client.clientUser?.name,
                          })
                        }
                      />
                    ))
                  )}
                </Card>

                <SectionHeader
                  title="Client Roster"
                  subtitle="Open a client to view measurements, notes, and timers."
                />
              </View>
            }
            renderItem={({ item }) => (
              <ListItem
                title={item.clientUser?.name ?? "Unassigned client"}
                subtitle={
                  item.storeName
                    ? `${item.storeName} • Updated ${new Date(
                        item.updatedAt
                      ).toLocaleDateString()}`
                    : `Updated ${new Date(item.updatedAt).toLocaleDateString()}`
                }
                onPress={() =>
                  navigation.navigate("ClientProfile", {
                    clientId: item.id,
                    clientName: item.clientUser?.name,
                  })
                }
              />
            )}
            ListEmptyComponent={
              <Text style={styles.placeholder}>
                You haven&apos;t added any clients yet. Tap the plus button to create one.
              </Text>
            }
            contentContainerStyle={styles.listContent}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.muted,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  metricsRow: {
    flexDirection: "row",
    columnGap: spacing.md,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 14,
  },
  metricValue: {
    marginTop: spacing.xs,
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  placeholder: {
    color: colors.muted,
    fontSize: 14,
    paddingVertical: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
});

export default TailorDashboardScreen;

