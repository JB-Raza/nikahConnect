import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AuthField, AuthScaffold, OrDivider, PrimaryButton, SocialButton, TextLink } from '@/features/auth/ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const dismiss = () => (router.canGoBack() ? router.back() : router.replace('/auth'));

  const submit = () => {
    const next: typeof errors = {};
    if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address.';
    if (password.length < 6) next.password = 'Use at least 6 characters.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/onboarding');
    }, 700);
  };

  return (
    <AuthScaffold
      title="Create your account"
      subtitle="Set up your login. You’ll add your profile details next."
      onBack={dismiss}
      footer={
        <>
          <PrimaryButton label="Create account" loading={loading} onPress={submit} />
          <TextLink prefix="Already have an account?" action="Log in" onPress={() => router.replace('/auth/login')} />
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
        placeholder="Create a password"
        secure
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />

      <View>
        <OrDivider />
        <SocialButton label="Continue with Google" icon="logo-google" onPress={() => router.replace('/onboarding')} />
      </View>
    </AuthScaffold>
  );
}
