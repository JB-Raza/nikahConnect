import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GradientHeader from '@/components/gradient-header';
import { colors, radius, shadow, spacing, typography } from '@/theme/theme';

const palette = colors.light;

type SettingsScaffoldProps = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  fallback?: string;
};

export function SettingsScaffold({ title, children, footer, fallback = '/(tabs)/menu' }: SettingsScaffoldProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const dismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallback as never);
    }
  };

  return (
    <View style={styles.screen}>
      <GradientHeader title={title} onBack={dismiss} align="center" />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={spacing.xl}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}>
        {children}
      </KeyboardAwareScrollView>

      {footer ? <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>{footer}</View> : null}
    </View>
  );
}

export function SettingsSection({ title, children }: { title?: string; children: React.ReactNode }) {
  const items = React.Children.toArray(children);
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={styles.sectionCard}>
        {items.map((child, index) => (
          <View key={index}>
            {index > 0 ? <View style={styles.divider} /> : null}
            {child}
          </View>
        ))}
      </View>
    </View>
  );
}

type SettingsRowProps = {
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  description?: string;
  value?: string;
  valueTint?: string;
  tint?: string;
  danger?: boolean;
  showChevron?: boolean;
  onPress?: () => void;
};

export function SettingsRow({
  icon,
  label,
  description,
  value,
  valueTint,
  tint,
  danger,
  showChevron = true,
  onPress,
}: SettingsRowProps) {
  const iconColor = tint ?? palette.primary;
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && onPress ? styles.rowPressed : null]}
      onPress={onPress}
      disabled={!onPress}>
      {icon ? (
        <View style={[styles.rowIcon, { backgroundColor: `${iconColor}1a` }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
      ) : null}
      <View style={styles.rowTextWrap}>
        <Text style={[styles.rowLabel, danger && { color: palette.danger }]}>{label}</Text>
        {description ? <Text style={styles.rowDescription}>{description}</Text> : null}
      </View>
      <View style={styles.rowRight}>
        {value ? <Text style={[styles.rowValue, valueTint ? { color: valueTint } : null]}>{value}</Text> : null}
        {showChevron && onPress ? <Ionicons name="chevron-forward" size={18} color={palette.textSecondary} /> : null}
      </View>
    </Pressable>
  );
}

export function SettingsToggle({
  icon,
  label,
  description,
  value,
  onChange,
}: {
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  description?: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      {icon ? (
        <View style={[styles.rowIcon, { backgroundColor: `${palette.primary}1a` }]}>
          <Ionicons name={icon} size={18} color={palette.primary} />
        </View>
      ) : null}
      <View style={styles.rowTextWrap}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description ? <Text style={styles.rowDescription}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: palette.border, true: palette.primary }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

export function InfoHeading({ children }: { children: React.ReactNode }) {
  return <Text style={styles.infoHeading}>{children}</Text>;
}

export function InfoParagraph({ children }: { children: React.ReactNode }) {
  return <Text style={styles.infoParagraph}>{children}</Text>;
}

export function InfoBullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

export const settingsPalette = palette;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: palette.background,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
  },
  sectionCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.cardBorder,
    overflow: 'hidden',
    ...shadow.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 56,
  },
  rowPressed: {
    backgroundColor: palette.chipSurfaceSoft,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.border,
    marginLeft: spacing.md,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextWrap: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  rowDescription: {
    fontSize: typography.caption,
    fontWeight: '500',
    color: palette.textSecondary,
    lineHeight: 17,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  rowValue: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  infoHeading: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: palette.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  infoParagraph: {
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
    lineHeight: 22,
  },
});
