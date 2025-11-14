import React, { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import colors from "../theme/colors";
import spacing from "../theme/spacing";

interface CardProps {
  children: ReactNode;
  padding?: keyof typeof spacing;
}

const Card: React.FC<CardProps> = ({ children, padding = "md" }) => {
  return <View style={[styles.card, { padding: spacing[padding] }]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: spacing.md,
  },
});

export default Card;

