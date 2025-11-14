import React, { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import colors from "../theme/colors";
import spacing from "../theme/spacing";

interface ListItemProps {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
}

const ListItem: React.FC<ListItemProps> = ({ title, subtitle, trailing, onPress }) => {
  const content = (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable style={styles.pressable} onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.pressable}>{content}</View>;
};

const styles = StyleSheet.create({
  pressable: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  subtitle: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 14,
  },
  trailing: {
    flexShrink: 0,
  },
});

export default ListItem;

