import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthField, AuthScaffold, OrDivider, PrimaryButton, SocialButton, TextLink, authPalette } from '@/features/auth/ui';
import { spacing, typography } from '@/theme/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const dismiss = () => (router.canGoBack() ? router.back() : router.replace('/auth'));

  const submit = () => {
    const next: typeof errors = {};
    if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address.';
    if (password.length < 1) next.password = 'Enter your password.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)/marriage');
    }, 700);
  };

  return (
    <AuthScaffold
      title="Welcome back"
      subtitle="Log in to continue your search."
      onBack={dismiss}
      footer={
        <>
          <PrimaryButton label="Log in" loading={loading} onPress={submit} />
          <TextLink prefix="New here?" action="Create an account" onPress={() => router.replace('/auth/sign-up')} />
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
        error={errors.email}
      />
      <AuthField
        label="Password"
        icon="lock-closed-outline"
        placeholder="Your password"
        secure
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />

      <Pressable onPress={() => router.push('/auth/forgot-password')} hitSlop={8} style={styles.forgotRow}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </Pressable>

      <View style={styles.socialStack}>
        <OrDivider />
        <SocialButton label="Continue with Google" icon="logo-google" onPress={() => router.replace('/(tabs)/marriage')} />
        <SocialButton label="Continue with Apple" icon="logo-apple" onPress={() => router.replace('/(tabs)/marriage')} />
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  socialStack: {
    gap: spacing.sm,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -spacing.xs,
  },
  forgotText: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: authPalette.primary,
  },
});
