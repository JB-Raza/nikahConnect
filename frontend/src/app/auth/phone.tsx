import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AuthScaffold, PrimaryButton, authPalette } from '@/features/auth/ui';
import { radius, sizing, spacing, typography } from '@/theme/theme';

const palette = authPalette;

export default function PhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | undefined>();

  const dismiss = () => (router.canGoBack() ? router.back() : router.replace('/auth'));

  const digits = phone.replace(/\D/g, '');
  const isValid = digits.length >= 7;

  const submit = () => {
    if (!isValid) {
      setError('Enter a valid phone number.');
      return;
    }
    setError(undefined);
    router.push({ pathname: '/auth/otp', params: { phone: `+92 ${digits}` } });
  };

  return (
    <AuthScaffold
      title="Enter your phone"
      subtitle="We'll send a 6-digit code to verify your number."
      onBack={dismiss}
      footer={<PrimaryButton label="Send code" disabled={!isValid} onPress={submit} />}>
      <Text style={styles.label}>Phone number</Text>
      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        <View style={styles.countryChip}>
          <Text style={styles.flag}>🇵🇰</Text>
          <Text style={styles.countryCode}>+92</Text>
          <Ionicons name="chevron-down" size={14} color={palette.textSecondary} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="3xx xxx xxxx"
          placeholderTextColor={palette.textSecondary}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          maxLength={15}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.note}>
        <Ionicons name="shield-checkmark-outline" size={16} color={palette.textSecondary} />
        <Text style={styles.noteText}>Your number stays private and is never shown on your profile.</Text>
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  inputRowError: {
    borderColor: palette.danger,
  },
  countryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingRight: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: palette.border,
  },
  flag: {
    fontSize: 18,
  },
  countryCode: {
    fontSize: typography.body,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  input: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '600',
    color: palette.textPrimary,
    paddingVertical: spacing.sm,
    letterSpacing: 1,
  },
  error: {
    fontSize: typography.label,
    fontWeight: '600',
    color: palette.danger,
    marginTop: spacing.xs,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingRight: spacing.md,
  },
  noteText: {
    flex: 1,
    fontSize: typography.caption,
    fontWeight: '500',
    color: palette.textSecondary,
    lineHeight: 18,
  },
});
