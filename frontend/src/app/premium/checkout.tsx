import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GradientButton from '@/components/gradient-button';
import { usePremium } from '@/features/premium/premium-context';
import { getPlan } from '@/features/premium/plans';
import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

const palette = colors.light;

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { plan: planParam } = useLocalSearchParams<{ plan?: string }>();
  const { activate } = usePremium();
  const plan = getPlan(planParam);

  const [name, setName] = useState('');
  const [card, setCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const dismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/premium');
    }
  };

  const cardValid = card.replace(/\s/g, '').length >= 15;
  const isValid = name.trim().length >= 2 && cardValid && expiry.length >= 4 && cvc.length >= 3;

  const pay = () => {
    if (!isValid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      activate(plan.id);
      setDone(true);
    }, 1100);
  };

  if (done) {
    return (
      <View style={[styles.screen, styles.successScreen, { paddingTop: insets.top }]}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={44} color="#ffffff" />
        </View>
        <Text style={styles.successTitle}>Welcome to Premium</Text>
        <Text style={styles.successBody}>
          Your {plan.label} plan is active. You can now see who likes you and enjoy every Premium feature.
        </Text>
        <GradientButton label="See who likes you" onPress={() => router.replace('/likes')} style={styles.cta} />
        <Pressable style={styles.ghost} onPress={() => router.replace('/(tabs)/marriage')}>
          <Text style={styles.ghostText}>Back to browsing</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.xs }]}>
      <View style={styles.header}>
        <Pressable onPress={dismiss} hitSlop={10} style={styles.backButton} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={26} color={palette.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <View style={styles.summary}>
            <View style={styles.summaryIcon}>
              <Ionicons name="diamond" size={20} color="#ffffff" />
            </View>
            <View style={styles.summaryText}>
              <Text style={styles.summaryTitle}>NikahConnect Premium</Text>
              <Text style={styles.summarySub}>{plan.label} · {plan.per}</Text>
            </View>
            <Text style={styles.summaryPrice}>{plan.price}</Text>
          </View>

          <Text style={styles.sectionLabel}>Payment details</Text>

          <Field label="Cardholder name" placeholder="Name on card" autoCapitalize="words" value={name} onChangeText={setName} />
          <Field
            label="Card number"
            placeholder="4242 4242 4242 4242"
            keyboardType="number-pad"
            value={card}
            onChangeText={(value) => setCard(formatCard(value))}
            maxLength={19}
            icon="card-outline"
          />
          <View style={styles.row}>
            <View style={styles.flex}>
              <Field
                label="Expiry"
                placeholder="MM/YY"
                keyboardType="number-pad"
                value={expiry}
                onChangeText={(value) => setExpiry(formatExpiry(value))}
                maxLength={5}
              />
            </View>
            <View style={styles.flex}>
              <Field
                label="CVC"
                placeholder="123"
                keyboardType="number-pad"
                value={cvc}
                onChangeText={(value) => setCvc(value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
              />
            </View>
          </View>

          <View style={styles.secureNote}>
            <Ionicons name="lock-closed" size={14} color={palette.textSecondary} />
            <Text style={styles.secureText}>Payments are encrypted and secure. This is a demo checkout.</Text>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <GradientButton
            label={`Pay ${plan.price}`}
            onPress={pay}
            disabled={!isValid}
            loading={loading}
            style={styles.cta}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function formatCard(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function Field({
  label,
  icon,
  ...props
}: React.ComponentProps<typeof TextInput> & { label: string; icon?: React.ComponentProps<typeof Ionicons>['name'] }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldBox}>
        {icon ? <Ionicons name={icon} size={18} color={palette.textSecondary} /> : null}
        <TextInput style={styles.fieldInput} placeholderTextColor={palette.textSecondary} {...props} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.titleMd,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: palette.premiumSurface,
    borderWidth: 1,
    borderColor: palette.premiumBorder,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: palette.premiumAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: typography.body,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  summarySub: {
    fontSize: typography.caption,
    fontWeight: '500',
    color: palette.textSecondary,
  },
  summaryPrice: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  sectionLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.xs,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.md,
  },
  fieldInput: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '600',
    color: palette.textPrimary,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  secureText: {
    flex: 1,
    fontSize: typography.caption,
    fontWeight: '500',
    color: palette.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: palette.background,
  },
  cta: {
    alignSelf: 'stretch',
  },
  successScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  successIcon: {
    width: 92,
    height: 92,
    borderRadius: radius.pill,
    backgroundColor: palette.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: typography.title,
    fontWeight: '900',
    color: palette.textPrimary,
    textAlign: 'center',
  },
  successBody: {
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  ghost: {
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  ghostText: {
    fontSize: typography.button,
    fontWeight: '700',
    color: palette.textSecondary,
  },
});
