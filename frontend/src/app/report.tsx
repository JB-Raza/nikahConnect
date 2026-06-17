import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

const palette = colors.light;

const REASONS = [
  'Fake or scam profile',
  'Inappropriate photos',
  'Inappropriate messages',
  'Harassment or bullying',
  'Underage user',
  'Asking for money',
  'Off-platform behaviour',
  'Something else',
];

export default function ReportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { name } = useLocalSearchParams<{ name?: string }>();

  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const subject = name ?? 'this user';

  const dismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/marriage');
    }
  };

  if (submitted) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={palette.success} />
          </View>
          <Text style={styles.successTitle}>Report submitted</Text>
          <Text style={styles.successBody}>
            Thank you for helping keep NikahConnect safe. Our team will review your report confidentially and take
            action if our guidelines were broken.
          </Text>
          <Pressable style={styles.primaryButton} onPress={dismiss}>
            <Text style={styles.primaryButtonText}>Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.xs }]}>
      <View style={styles.header}>
        <Pressable onPress={dismiss} hitSlop={10} style={styles.backButton} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={26} color={palette.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Report</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}>
          <Text style={styles.title}>Report {subject}</Text>
          <Text style={styles.subtitle}>
            Your report is anonymous. {subject} won’t know you reported them.
          </Text>

          <Text style={styles.sectionLabel}>Why are you reporting?</Text>
          <View style={styles.reasonList}>
            {REASONS.map((item) => {
              const selected = reason === item;
              return (
                <Pressable
                  key={item}
                  style={({ pressed }) => [styles.reasonRow, pressed && styles.reasonPressed]}
                  onPress={() => setReason(item)}>
                  <Text style={[styles.reasonLabel, selected && styles.reasonLabelActive]}>{item}</Text>
                  <View style={[styles.radio, selected && styles.radioActive]}>
                    {selected ? <Ionicons name="checkmark" size={14} color="#ffffff" /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Add details (optional)</Text>
          <TextInput
            style={styles.detailsInput}
            placeholder="Share anything that helps our team understand the issue…"
            placeholderTextColor={palette.textSecondary}
            multiline
            maxLength={500}
            textAlignVertical="top"
            value={details}
            onChangeText={setDetails}
          />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <Pressable
            onPress={() => reason && setSubmitted(true)}
            disabled={!reason}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: !reason ? palette.tabBarInactive : pressed ? palette.primaryPressed : palette.primary },
            ]}>
            <Text style={styles.primaryButtonText}>Submit report</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  backButton: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: typography.titleMd, fontWeight: '800', color: palette.textPrimary },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  title: { fontSize: typography.title, lineHeight: 36, fontWeight: '800', color: palette.textPrimary },
  subtitle: { fontSize: typography.body, fontWeight: '500', color: palette.textSecondary, lineHeight: 21, marginTop: spacing.xs },
  sectionLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  reasonList: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    overflow: 'hidden',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
  },
  reasonPressed: { backgroundColor: palette.chipSurfaceSoft },
  reasonLabel: { flex: 1, fontSize: typography.body, fontWeight: '600', color: palette.textPrimary },
  reasonLabelActive: { color: palette.primary, fontWeight: '800' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: palette.primary, backgroundColor: palette.primary },
  detailsInput: {
    minHeight: 120,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: spacing.md,
    fontSize: typography.body,
    fontWeight: '500',
    lineHeight: 22,
    color: palette.textPrimary,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: palette.background,
  },
  primaryButton: {
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
    paddingHorizontal: spacing.xl,
  },
  primaryButtonText: { fontSize: typography.button, fontWeight: '800', color: palette.textOnPrimary },
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.sm },
  successIcon: { marginBottom: spacing.xs },
  successTitle: { fontSize: typography.title, fontWeight: '800', color: palette.textPrimary, textAlign: 'center' },
  successBody: {
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
});
