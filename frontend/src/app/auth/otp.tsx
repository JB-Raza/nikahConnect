import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AuthScaffold, PrimaryButton, authPalette } from '@/features/auth/ui';
import { radius, spacing, typography } from '@/theme/theme';

const palette = authPalette;
const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [loading, setLoading] = useState(false);

  const dismiss = () => (router.canGoBack() ? router.back() : router.replace('/auth'));

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds((value) => (value <= 1 ? 0 : value - 1)), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const isComplete = code.length === CODE_LENGTH;

  const verify = () => {
    if (!isComplete) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/onboarding');
    }, 700);
  };

  const resend = () => {
    if (seconds > 0) return;
    setSeconds(RESEND_SECONDS);
    setCode('');
    inputRef.current?.focus();
  };

  return (
    <AuthScaffold
      title="Verify your number"
      subtitle={`Enter the 6-digit code we sent to ${phone ?? 'your phone'}.`}
      onBack={dismiss}
      footer={<PrimaryButton label="Verify" loading={loading} disabled={!isComplete} onPress={verify} />}>
      <Pressable style={styles.boxesRow} onPress={() => inputRef.current?.focus()}>
        {Array.from({ length: CODE_LENGTH }).map((_, index) => {
          const char = code[index] ?? '';
          const active = index === code.length;
          return (
            <View key={index} style={[styles.box, (active || char) && styles.boxActive]}>
              <Text style={styles.boxText}>{char}</Text>
            </View>
          );
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, CODE_LENGTH))}
        keyboardType="number-pad"
        maxLength={CODE_LENGTH}
        autoFocus
        caretHidden
        style={styles.hiddenInput}
      />

      <View style={styles.resendRow}>
        {seconds > 0 ? (
          <Text style={styles.resendMuted}>
            Resend code in <Text style={styles.resendCount}>{seconds}s</Text>
          </Text>
        ) : (
          <Pressable onPress={resend} hitSlop={8}>
            <Text style={styles.resendActive}>Resend code</Text>
          </Pressable>
        )}
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  box: {
    flex: 1,
    aspectRatio: 0.86,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: {
    borderColor: palette.primary,
  },
  boxText: {
    fontSize: typography.title,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  resendMuted: {
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
  },
  resendCount: {
    fontWeight: '800',
    color: palette.textPrimary,
  },
  resendActive: {
    fontSize: typography.body,
    fontWeight: '800',
    color: palette.primary,
  },
});
