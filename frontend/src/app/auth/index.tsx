import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrDivider, PrimaryButton, SocialButton, TextLink } from '@/features/auth/ui';
import BrandLogo from '@/components/brand-logo';
import { spacing, typography } from '@/theme/theme';

export default function AuthWelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <Image source={require('@/assets/intro/intro-2.jpg')} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(8,16,24,0.35)', 'rgba(8,16,24,0.2)', 'rgba(8,16,24,0.78)', 'rgba(8,16,24,0.96)']}
        locations={[0, 0.32, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.brandRow, { top: insets.top + spacing.md }]}>
        <BrandLogo size={28} />
        <Text style={styles.brandText}>NikahConnect</Text>
      </View>

      <View style={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Text style={styles.title}>Find your spouse,{'\n'}the halal way.</Text>
        <Text style={styles.subtitle}>
          Faith-first matchmaking for Muslims seeking a sincere, marriage-minded partner.
        </Text>

        <View style={styles.actions}>
          <PrimaryButton label="Create account" icon="mail-outline" onPress={() => router.push('/auth/sign-up')} />

          <SocialButton label="Continue with Google" icon="logo-google" onPress={() => router.replace('/onboarding')} />
          <SocialButton label="Continue with Apple" icon="logo-apple" onPress={() => router.replace('/onboarding')} />
          <SocialButton label="Continue with phone" icon="call-outline" onPress={() => router.push('/auth/phone')} />

          <OrDivider />

          <Pressable style={styles.loginRow}>
            <TextLink prefix="Already have an account?" action="Log in" onPress={() => router.push('/auth/login')} />
          </Pressable>

          <Text style={styles.terms}>
            By continuing you agree to our <Text style={styles.termsLink}>Terms</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0b1622',
  },
  brandRow: {
    position: 'absolute',
    left: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  brandText: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.subtitle,
    lineHeight: 23,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.82)',
    marginBottom: spacing.xl,
  },
  actions: {
    gap: spacing.sm,
  },
  loginRow: {
    alignItems: 'center',
  },
  terms: {
    fontSize: typography.label,
    lineHeight: 17,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  termsLink: {
    fontWeight: '800',
    color: '#ffffff',
  },
});
