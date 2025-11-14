import React, { useEffect, useMemo, useState } from "react";
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
import { timerApi, TimerRecord } from "../../services/api";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";
import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";
import ListItem from "../../components/ListItem";

type Props = NativeStackScreenProps<TailorStackParamList, "Timer">;

const TimerScreen: React.FC<Props> = ({ route, navigation }) => {
  const { token } = useAuth();
  const clientId = route.params?.clientId;
  const clientName = route.params?.clientName;
  const [timers, setTimers] = useState<TimerRecord[]>([]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    navigation.setOptions({
      title: clientName ? `${clientName} • Timer` : "Time Tracking",
    });
  }, [clientName, navigation]);

  const loadTimers = async () => {
    if (!token || !clientId) {
      return;
    }
    setLoading(true);
    try {
      const response = await timerApi.list(token, clientId);
      setTimers(response);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load timers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimers();
  }, [clientId]);

  const activeTimer = useMemo(
    () => timers.find((timer) => !timer.endTime),
    [timers]
  );

  const startTimer = async () => {
    if (!token || !clientId) {
      return;
    }
    setLoading(true);
    try {
      await timerApi.start(token, { clientId, description: description || undefined });
      setDescription("");
      await loadTimers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start timer");
      setLoading(false);
    }
  };

  const stopTimer = async () => {
    if (!token || !activeTimer) {
      return;
    }
    setLoading(true);
    try {
      await timerApi.stop(token, { timerId: activeTimer.id });
      await loadTimers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to stop timer");
      setLoading(false);
    }
  };

  if (!clientId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.placeholder}>
          Select a client from your dashboard to track time.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Card>
        <SectionHeader
          title="Active Timer"
          subtitle="Track sourcing, fittings, and project work."
        />
        {activeTimer ? (
          <View>
            <Text style={styles.label}>Started</Text>
            <Text style={styles.value}>
              {new Date(activeTimer.startTime).toLocaleString()}
            </Text>
            {activeTimer.description ? (
              <>
                <Text style={styles.label}>Description</Text>
                <Text style={styles.value}>{activeTimer.description}</Text>
              </>
            ) : null}
            <View style={styles.buttonRow}>
              <Button title="Stop Timer" onPress={stopTimer} disabled={loading} />
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.placeholder}>
              No active timer. Start one to log your work.
            </Text>
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Fabric sourcing, fitting prep..."
              value={description}
              onChangeText={setDescription}
              editable={!loading}
            />
            <View style={styles.buttonRow}>
              <Button title="Start Timer" onPress={startTimer} disabled={loading} />
            </View>
          </View>
        )}
        {loading && !activeTimer ? (
          <ActivityIndicator style={{ marginTop: spacing.sm }} color={colors.primary} />
        ) : null}
      </Card>

      <Card>
        <SectionHeader
          title="History"
          subtitle="Review completed sessions and durations."
        />
        {loading && timers.length === 0 ? (
          <ActivityIndicator color={colors.primary} />
        ) : timers.length === 0 ? (
          <Text style={styles.placeholder}>No time entries recorded yet.</Text>
        ) : (
          timers.map((timer) => (
            <ListItem
              key={timer.id}
              title={
                timer.duration
                  ? `${timer.duration} minutes`
                  : "In progress"
              }
              subtitle={`${new Date(timer.startTime).toLocaleString()}${
                timer.description ? ` • ${timer.description}` : ""
              }`}
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
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  placeholder: {
    color: colors.muted,
    fontSize: 14,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  label: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    marginTop: spacing.xs,
  },
  input: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  buttonRow: {
    marginTop: spacing.md,
  },
});

export default TimerScreen;

