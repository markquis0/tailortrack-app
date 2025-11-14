import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ClientStackParamList } from "../../navigation/types";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";
import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";

type Props = NativeStackScreenProps<ClientStackParamList, "ClientMaterials">;

const presetMaterials = [
  "Cotton",
  "Linen",
  "Wool",
  "Cashmere",
  "Silk",
  "Denim",
  "Leather",
  "Suede",
  "Synthetic blends",
];

const ClientMaterialsScreen: React.FC<Props> = () => {
  const { token } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const load = async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    try {
      const clientResponse = await api.getClients(token);
      const normalized = Array.isArray(clientResponse) ? clientResponse[0] : clientResponse;
      if (!normalized) {
        throw new Error("Client profile not found");
      }
      setClientId(normalized.id);
      const measurementResponse = await api
        .getMeasurements(token, normalized.id)
        .catch(() => null);
      if (measurementResponse?.materialPreference) {
        setSelected(
          measurementResponse.materialPreference
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        );
      }
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleMaterial = (material: string) => {
    setSelected((current) =>
      current.includes(material)
        ? current.filter((item) => item !== material)
        : [...current, material]
    );
  };

  const save = async () => {
    if (!token || !clientId) {
      return;
    }
    setLoading(true);
    try {
      await api.upsertMeasurements(token, {
        clientId,
        materialPreference: selected.join(", "),
      });
      Alert.alert("Saved", "Your material preferences are updated.");
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Could not save preferences"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!clientId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>
          {error ?? "We need your profile to customize materials."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Card>
        <SectionHeader
          title="Favorite fabrics"
          subtitle="Pick materials you love so your tailor can source the right textiles."
        />
        <View style={styles.tagGrid}>
          {presetMaterials.map((material) => {
            const isActive = selected.includes(material);
            return (
              <Pressable
                key={material}
                style={[
                  styles.tag,
                  isActive && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => toggleMaterial(material)}
              >
                <Text
                  style={[
                    styles.tagLabel,
                    isActive && { color: "#fff" },
                  ]}
                >
                  {material}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable style={styles.saveButton} onPress={save} disabled={loading}>
          <Text style={styles.saveLabel}>{loading ? "Saving..." : "Save preferences"}</Text>
        </Pressable>
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
  error: {
    color: colors.danger,
    textAlign: "center",
  },
  tagGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  tag: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tagLabel: {
    color: colors.text,
  },
  saveButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  saveLabel: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default ClientMaterialsScreen;

