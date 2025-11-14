import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import colors from "../theme/colors";
import spacing from "../theme/spacing";

type Mode = "login" | "register";

const AuthScreen: React.FC = () => {
  const { login, register, status, error } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"tailor" | "client">("client");

  const isLoading = status === "loading";

  const handleSubmit = async () => {
    if (mode === "login") {
      await login(email.trim(), password);
      return;
    }

    await register(name.trim(), email.trim(), password, role);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>TailorTrack</Text>
        <Text style={styles.subtitle}>
          {mode === "login"
            ? "Sign in to manage your measurements and appointments."
            : "Create an account to get started."}
        </Text>

        {mode === "register" ? (
          <>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              placeholder="Alex Taylor"
              style={styles.input}
              value={name}
              onChangeText={setName}
              editable={!isLoading}
            />
          </>
        ) : null}

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="you@example.com"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="••••••••"
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
        />

        {mode === "register" ? (
          <View style={styles.segment}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                role === "client" && styles.segmentButtonActive,
              ]}
              onPress={() => setRole("client")}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  role === "client" && styles.segmentLabelActive,
                ]}
              >
                Client
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                role === "tailor" && styles.segmentButtonActive,
              ]}
              onPress={() => setRole("tailor")}
            >
              <Text
                style={[
                  styles.segmentLabel,
                  role === "tailor" && styles.segmentLabelActive,
                ]}
              >
                Tailor
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.disabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {mode === "login" ? "Sign In" : "Create Account"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setMode(mode === "login" ? "register" : "login")}
        >
          <Text style={styles.secondaryButtonText}>
            {mode === "login"
              ? "Need an account? Register"
              : "Already have an account? Sign in"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.muted,
    fontSize: 16,
  },
  label: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    color: colors.muted,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  segment: {
    flexDirection: "row",
    marginTop: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  segmentButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  segmentButtonActive: {
    backgroundColor: colors.primary,
  },
  segmentLabel: {
    fontSize: 16,
    color: colors.text,
  },
  segmentLabelActive: {
    color: "#fff",
    fontWeight: "600",
  },
  primaryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: spacing.sm,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "500",
  },
  error: {
    marginTop: spacing.sm,
    color: colors.danger,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default AuthScreen;

