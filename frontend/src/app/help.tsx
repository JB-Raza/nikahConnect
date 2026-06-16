import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { SettingsRow, SettingsScaffold, SettingsSection, settingsPalette } from '@/components/settings-kit';
import { radius, spacing, typography } from '@/theme/theme';

const palette = settingsPalette;

const FAQS = [
  {
    q: 'How do matches work?',
    a: 'When you and another member like each other, it becomes a match and you can start chatting. Premium members can also see who liked them first.',
  },
  {
    q: 'How do I get verified?',
    a: 'Open Menu → Verification and take a quick selfie. Our team confirms it’s really you and adds a verified badge to your profile.',
  },
  {
    q: 'Who can see my profile?',
    a: 'Only members that match your and their preferences. You can further limit visibility with the privacy toggles in Menu.',
  },
  {
    q: 'How do I cancel Premium?',
    a: 'Subscriptions are managed through your app store. Open your store account, find NikahConnect, and cancel — you keep access until the period ends.',
  },
  {
    q: 'How do I report someone?',
    a: 'Open their profile or chat, tap the menu, and choose Report. Reports are always confidential.',
  },
];

export default function HelpScreen() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <SettingsScaffold title="Help & support">
      <View style={styles.faqWrap}>
        <Text style={styles.sectionLabel}>Frequently asked</Text>
        <View style={styles.faqCard}>
          {FAQS.map((item, index) => {
            const expanded = open === index;
            return (
              <View key={item.q}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <Pressable style={styles.faqHeader} onPress={() => setOpen(expanded ? null : index)}>
                  <Text style={styles.faqQuestion}>{item.q}</Text>
                  <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={palette.textSecondary} />
                </Pressable>
                {expanded ? <Text style={styles.faqAnswer}>{item.a}</Text> : null}
              </View>
            );
          })}
        </View>
      </View>

      <SettingsSection title="Contact us">
        <SettingsRow
          icon="mail-outline"
          label="Email support"
          description="support@nikahconnect.app"
          onPress={() => Linking.openURL('mailto:support@nikahconnect.app')}
        />
        <SettingsRow icon="chatbubbles-outline" label="Live chat" description="Typically replies within a few hours" onPress={() => {}} />
        <SettingsRow
          icon="globe-outline"
          label="Help center"
          onPress={() => Linking.openURL('https://nikahconnect.app/help')}
        />
      </SettingsSection>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  faqWrap: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
  },
  faqCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.border,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  faqQuestion: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  faqAnswer: {
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
    lineHeight: 21,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});
