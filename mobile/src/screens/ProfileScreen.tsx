import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import colors from "../theme/colors";
import spacing from "../theme/spacing";
import Card from "../components/Card";
import SectionHeader from "../components/SectionHeader";

const ProfileScreen: React.FC = () => {
  const { user, updateProfile, status } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        email: email.trim() || undefined,
      });
      Alert.alert("Profile updated", "Your profile information has been saved.");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.placeholder}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <SectionHeader
          title="Profile Information"
          subtitle={
            user?.isAnonymous
              ? "Add your name and email to personalize your account. This is optional."
              : "Update your profile information."
          }
        />
        <View style={styles.inputGroup}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="John"
            autoCapitalize="words"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Doe"
            autoCapitalize="words"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="john.doe@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {user?.isAnonymous && (
          <Text style={styles.hint}>
            Adding your information will convert your anonymous account to a personalized one.
          </Text>
        )}
        <Button
          title="Save Profile"
          onPress={handleSave}
          disabled={saving}
        />
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
    marginTop: spacing.sm,
    color: colors.muted,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
    color: colors.muted,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  hint: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    color: colors.muted,
    fontSize: 13,
    fontStyle: "italic",
  },
});

export default ProfileScreen;

