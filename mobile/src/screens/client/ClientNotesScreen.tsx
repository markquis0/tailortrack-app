import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ClientStackParamList } from "../../navigation/types";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";
import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";

type Props = NativeStackScreenProps<ClientStackParamList, "ClientNotes">;

const ClientNotesScreen: React.FC<Props> = () => {
  const { token, user } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const load = async () => {
    if (!token) {
      return;
    }
    // Anonymous users don't have client profiles, so skip loading
    if (user?.isAnonymous) {
      setError(undefined);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await api.getClients(token);
      const normalized = Array.isArray(response) ? response[0] : response;
      if (!normalized) {
        throw new Error("Client profile not found");
      }
      setClientId(normalized.id);
      setStoreName(normalized.storeName ?? "");
      setNotes(normalized.notes ?? "");
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!token || !clientId) {
      return;
    }
    setLoading(true);
    try {
      await api.updateClient(token, clientId, {
        storeName: storeName || null,
        notes: notes || null,
      });
      Alert.alert("Saved", "Notes updated successfully.");
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !clientId) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.placeholder}>Loading notes...</Text>
      </View>
    );
  }

  if (user?.isAnonymous) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>
          Notes are only available for registered users with client profiles. Add your name and email in Account to create a profile.
        </Text>
      </View>
    );
  }

  if (!clientId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>
          {error ?? "We need your profile to add notes."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Card>
        <SectionHeader
          title="Store preferences"
          subtitle="Document the boutiques or brands you shop with frequently."
        />
        <Text style={styles.label}>Store / Boutique</Text>
        <TextInput
          style={styles.input}
          placeholder="Macy's, local atelier..."
          value={storeName}
          onChangeText={setStoreName}
        />
      </Card>

      <Card>
        <SectionHeader
          title="Personal notes"
          subtitle="Add context for your tailor or reminders for yourself."
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Prefer relaxed waist fit, short sleeves slightly tapered..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={6}
        />
      </Card>

      <Button title="Save notes" onPress={save} disabled={loading} />
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
    gap: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  placeholder: {
    marginTop: spacing.sm,
    color: colors.muted,
  },
  error: {
    color: colors.danger,
    textAlign: "center",
  },
  label: {
    marginBottom: spacing.xs,
    color: colors.muted,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  multiline: {
    minHeight: 140,
    textAlignVertical: "top",
  },
});

export default ClientNotesScreen;

