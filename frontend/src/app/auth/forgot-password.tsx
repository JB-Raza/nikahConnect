import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthField, AuthScaffold, PrimaryButton, TextLink, authPalette } from '@/features/auth/ui';
import { radius, spacing, typography } from '@/theme/theme';

const palette = authPalette;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const dismiss = () => (router.canGoBack() ? router.back() : router.replace('/auth/login'));

  const submit = () => {
    if (!EMAIL_RE.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setError(undefined);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 700);
  };

  if (sent) {
    return (
      <AuthScaffold
        title="Check your email"
        subtitle={`We sent a password reset link to ${email.trim()}.`}
        onBack={dismiss}
        footer={<PrimaryButton label="Back to login" onPress={() => router.replace('/auth/login')} />}>
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Ionicons name="mail-open-outline" size={34} color={palette.primary} />
          </View>
          <Text style={styles.successHint}>
            Didn’t get the email? Check your spam folder, or resend the link.
          </Text>
          <TextLink action="Resend link" onPress={() => setSent(false)} />
        </View>
      </AuthScaffold>
    );
  }

  return (
    <AuthScaffold
      title="Forgot password?"
      subtitle="Enter the email linked to your account and we'll send a reset link."
      onBack={dismiss}
      footer={
        <>
          <PrimaryButton label="Send reset link" loading={loading} onPress={submit} />
          <TextLink prefix="Remembered it?" action="Log in" onPress={() => router.replace('/auth/login')} />
        </>
      }>
      <AuthField
        label="Email"
        icon="mail-outline"
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        error={error}
      />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  successWrap: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  successIcon: {
    width: 84,
    height: 84,
    borderRadius: radius.pill,
    backgroundColor: palette.chipSurfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successHint: {
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
});
