import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { SettingsRow, SettingsScaffold, SettingsSection, settingsPalette } from '@/components/settings-kit';
import { radius, spacing, typography } from '@/theme/theme';

const palette = settingsPalette;
const APP_VERSION = '1.0.0';

export default function AboutScreen() {
  const router = useRouter();
  return (
    <SettingsScaffold title="About">
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Ionicons name="heart" size={30} color="#ffffff" />
        </View>
        <Text style={styles.appName}>NikahConnect</Text>
        <Text style={styles.version}>Version {APP_VERSION}</Text>
        <Text style={styles.tagline}>Faith-first matchmaking for Muslims seeking a sincere, marriage-minded partner.</Text>
      </View>

      <SettingsSection title="Learn more">
        <SettingsRow icon="globe-outline" label="Website" onPress={() => Linking.openURL('https://nikahconnect.app')} />
        <SettingsRow icon="star-outline" label="Rate NikahConnect" onPress={() => {}} />
        <SettingsRow icon="share-social-outline" label="Share with a friend" onPress={() => {}} />
      </SettingsSection>

      <SettingsSection title="Legal">
        <SettingsRow icon="document-text-outline" label="Terms & Privacy" onPress={() => router.push('/legal')} />
        <SettingsRow icon="people-outline" label="Community guidelines" onPress={() => router.push('/guidelines')} />
      </SettingsSection>

      <Text style={styles.copyright}>Made with care for the ummah.{'\n'}© 2026 NikahConnect. All rights reserved.</Text>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  brand: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: typography.title,
    fontWeight: '900',
    color: palette.textPrimary,
  },
  version: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: palette.textSecondary,
    marginTop: 2,
  },
  tagline: {
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  copyright: {
    fontSize: typography.caption,
    fontWeight: '500',
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
