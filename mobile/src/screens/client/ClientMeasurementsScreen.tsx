import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ClientStackParamList } from "../../navigation/types";
import { useAuth } from "../../hooks/useAuth";
import api, { MeasurementRecord } from "../../services/api";
import colors from "../../theme/colors";
import spacing from "../../theme/spacing";
import Card from "../../components/Card";
import SectionHeader from "../../components/SectionHeader";

type Props = NativeStackScreenProps<ClientStackParamList, "ClientMeasurements">;

const numericFields: Array<keyof MeasurementRecord> = [
  "chest",
  "overarm",
  "waist",
  "hipSeat",
  "neck",
  "arm",
  "pantOutseam",
  "pantInseam",
  "coatInseam",
  "height",
  "weight",
];

const sizeFields: Array<keyof MeasurementRecord> = [
  "coatSize",
  "dressShirtSize",
  "shoeSize",
];

const preferenceFields: Array<keyof MeasurementRecord> = [
  "materialPreference",
];

const fieldLabels: Partial<Record<keyof MeasurementRecord, string>> = {
  chest: "Chest",
  overarm: "Overarm",
  waist: "Waist",
  hipSeat: "Hip Seat",
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

const formatLabel = (key: keyof MeasurementRecord) => {
  if (fieldLabels[key]) {
    return fieldLabels[key] as string;
  }
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase())
    .trim();
};

const normalizeHeightDigits = (digits: string) => {
  if (!digits) {
    return { feet: 0, inches: 0 };
  }
  if (digits.length === 1) {
    return { feet: parseInt(digits, 10) || 0, inches: 0 };
  }
  if (digits.length === 2) {
    return {
      feet: parseInt(digits.charAt(0), 10) || 0,
      inches: parseInt(digits.charAt(1), 10) || 0,
    };
  }
  const feetDigits = digits.slice(0, -2);
  const inchDigits = digits.slice(-2);
  const feet = parseInt(feetDigits, 10) || 0;
  let inches = parseInt(inchDigits, 10) || 0;
  if (inches > 11) {
    const extraFeet = Math.floor(inches / 12);
    inches = inches % 12;
    return { feet: feet + extraFeet, inches };
  }
  return { feet, inches };
};

const formatHeightInput = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  if (!digits) {
    return "";
  }
  const { feet, inches } = normalizeHeightDigits(digits);
  return `${feet}' ${inches}''`;
};

const formatHeightFromNumber = (value: number) => {
  if (!Number.isFinite(value)) {
    return "";
  }
  const totalInches = Math.max(0, Math.round(value));
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}' ${inches}''`;
};

const parseHeightToInches = (formatted: string) => {
  if (!formatted) {
    return undefined;
  }
  const digits = formatted.replace(/\D/g, "");
  if (!digits) {
    return undefined;
  }
  const { feet, inches } = normalizeHeightDigits(digits);
  return feet * 12 + inches;
};

const ClientMeasurementsScreen: React.FC<Props> = () => {
  const { token, user } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pantWaist, setPantWaist] = useState("");
  const [pantLength, setPantLength] = useState("");

  const load = async () => {
    if (!token) {
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      // For anonymous users, load measurements directly
      if (user?.isAnonymous) {
        const measurementResponse = await api
          .getMeasurements(token)
          .catch(() => null);
        const nextValues: Record<string, string> = {};
        if (measurementResponse) {
          if (measurementResponse.pantSize) {
            const parts = String(measurementResponse.pantSize)
              .split(/[xX/]/)
              .map((part) => part.trim())
              .filter(Boolean);
            setPantWaist(parts[0] ?? "");
            setPantLength(parts[1] ?? "");
          } else {
            setPantWaist("");
            setPantLength("");
          }
          [...numericFields, ...sizeFields, ...preferenceFields].forEach((field) => {
            const value = measurementResponse[field];
            if (value !== undefined && value !== null) {
              if (field === "height") {
                nextValues[field] = formatHeightFromNumber(Number(value));
              } else {
                nextValues[field] = String(value);
              }
            }
          });
        }
        setValues(nextValues);
      } else {
        // For authenticated users with clients
        const clientResponse = await api.getClients(token);
        const normalized = Array.isArray(clientResponse) ? clientResponse[0] : clientResponse;
        if (!normalized) {
          throw new Error("Client profile not found");
        }
        setClientId(normalized.id);
        const measurementResponse = await api
          .getMeasurements(token, normalized.id)
          .catch(() => null);
        const nextValues: Record<string, string> = {};
        if (measurementResponse) {
          if (measurementResponse.pantSize) {
            const parts = String(measurementResponse.pantSize)
              .split(/[xX/]/)
              .map((part) => part.trim())
              .filter(Boolean);
            setPantWaist(parts[0] ?? "");
            setPantLength(parts[1] ?? "");
          } else {
            setPantWaist("");
            setPantLength("");
          }
          [...numericFields, ...sizeFields, ...preferenceFields].forEach((field) => {
            const value = measurementResponse[field];
            if (value !== undefined && value !== null) {
              if (field === "height") {
                nextValues[field] = formatHeightFromNumber(Number(value));
              } else {
                nextValues[field] = String(value);
              }
            }
          });
        }
        setValues(nextValues);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load measurements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateValue = (key: string, value: string) => {
    if (key === "height") {
      const formatted = value.trim() ? formatHeightInput(value) : "";
      setValues((prev) => ({ ...prev, [key]: formatted }));
      return;
    }
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    if (!token) {
      return;
    }
    // For authenticated users, clientId is required
    if (!user?.isAnonymous && !clientId) {
      return;
    }
    setLoading(true);
    try {
      const payload: MeasurementRecord = user?.isAnonymous
        ? { userId: user.id }
        : { clientId: clientId! };
      numericFields.forEach((field) => {
        const val = values[field];
        if (val) {
          if (field === "height") {
            const parsedHeight = parseHeightToInches(val);
            if (parsedHeight !== undefined) {
              payload[field] = parsedHeight as never;
            }
            return;
          }
          const parsed = Number(val);
          if (!Number.isNaN(parsed)) {
            payload[field] = parsed as never;
          }
        }
      });
      sizeFields.forEach((field) => {
        const val = values[field];
        if (val) {
          payload[field] = val as never;
        }
      });
      preferenceFields.forEach((field) => {
        const val = values[field];
        if (val) {
          payload[field] = val as never;
        }
      });
      const formattedPantWaist = pantWaist.trim();
      const formattedPantLength = pantLength.trim();
      if (formattedPantWaist || formattedPantLength) {
        const pantSizeValue =
          formattedPantWaist && formattedPantLength
            ? `${formattedPantWaist}x${formattedPantLength}`
            : formattedPantWaist || formattedPantLength;
        payload.pantSize = pantSizeValue as never;
      }
      await api.upsertMeasurements(token, payload);
      Alert.alert("Measurements updated", "Your measurements are saved.");
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Could not save measurements"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user?.isAnonymous && !clientId) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.placeholder}>Loading measurements...</Text>
      </View>
    );
  }

  if (!user?.isAnonymous && !clientId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>
          {error ?? "We need your profile to update measurements."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Card>
        <SectionHeader
          title="Body measurements"
          subtitle="Enter the latest measurements in inches or centimeters."
        />
        {numericFields.map((field) => (
          <View key={field} style={styles.inputGroup}>
            <Text style={styles.label}>{formatLabel(field)}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={values[field] ?? ""}
              onChangeText={(value) => updateValue(field, value)}
              placeholder={formatLabel(field) === "Height" ? "5' 10''" : "0.0"}
            />
          </View>
        ))}
      </Card>

      <Card>
        <SectionHeader
          title="Sizes"
          subtitle="Share the sizing info your tailor relies on."
        />
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pant Waist Size</Text>
          <TextInput
            style={styles.input}
            value={pantWaist}
            onChangeText={setPantWaist}
            placeholder="32"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pant Length</Text>
          <TextInput
            style={styles.input}
            value={pantLength}
            onChangeText={setPantLength}
            placeholder="34"
          />
        </View>
        {sizeFields.map((field) => (
          <View key={field} style={styles.inputGroup}>
            <Text style={styles.label}>{formatLabel(field)}</Text>
            <TextInput
              style={styles.input}
              value={values[field] ?? ""}
              onChangeText={(value) => updateValue(field, value)}
              placeholder="42R / 10.5 US"
            />
          </View>
        ))}
      </Card>

      <Card>
        <SectionHeader
          title="Material Preferences"
          subtitle="Share your favorite fabrics and materials."
        />
        {preferenceFields.map((field) => (
          <View key={field} style={styles.inputGroup}>
            <Text style={styles.label}>{formatLabel(field)}</Text>
            <TextInput
              style={styles.input}
              value={values[field] ?? ""}
              onChangeText={(value) => updateValue(field, value)}
              placeholder="Linen, cotton..."
            />
          </View>
        ))}
      </Card>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.disabled]}
        onPress={save}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>Save measurements</Text>
      </TouchableOpacity>
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
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
    color: colors.muted,
    textTransform: "capitalize",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  saveButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.6,
  },
});

export default ClientMeasurementsScreen;

