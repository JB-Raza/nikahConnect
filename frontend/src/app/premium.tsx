import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GradientButton from '@/components/gradient-button';
import IconCircleButton from '@/components/icon-circle-button';
import { usePremium, type PlanId } from '@/features/premium/premium-context';
import { PLANS, PREMIUM_BENEFITS, getPlan, type PremiumBenefit } from '@/features/premium/plans';
import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

const palette = colors.light;

export default function PremiumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium, plan: activePlan } = usePremium();
  const [selected, setSelected] = useState<PlanId>('yearly');

  const dismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/menu');
    }
  };

  return (
    <View style={styles.screen}>
      <IconCircleButton
        icon="close"
        onPress={dismiss}
        variant="onDark"
        size={44}
        iconSize={24}
        accessibilityLabel="Close"
        style={[styles.close, { top: insets.top + spacing.sm }]}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + sizing.buttonHeight + spacing.xxl * 2 }}>
        <LinearGradient colors={['#1a6fc0', '#2486e0', palette.background]} locations={[0, 0.55, 1]} style={[styles.hero, { paddingTop: insets.top + spacing.xxl + spacing.lg }]}>
          <View style={styles.crown}>
            <Ionicons name="diamond" size={30} color="#ffffff" />
          </View>
          <Text style={styles.heroTitle}>NikahConnect Premium</Text>
          <Text style={styles.heroSubtitle}>
            {isPremium ? 'Your Premium is active. Enjoy everything below.' : 'Find your spouse faster with the full experience.'}
          </Text>
        </LinearGradient>

        <View style={styles.body}>
          {PREMIUM_BENEFITS.map((benefit) => (
            <BenefitRow key={benefit.title} benefit={benefit} />
          ))}

          {!isPremium ? (
            <View style={styles.plans}>
              {PLANS.map((item) => {
                const active = selected === item.id;
                return (
                  <Pressable key={item.id} style={[styles.planCard, active && styles.planCardActive]} onPress={() => setSelected(item.id)}>
                    {item.badge ? (
                      <View style={styles.planBadge}>
                        <Text style={styles.planBadgeText}>{item.badge}</Text>
                      </View>
                    ) : null}
                    <View style={styles.planMain}>
                      <View style={[styles.radio, active && styles.radioActive]}>
                        {active ? <Ionicons name="checkmark" size={13} color="#ffffff" /> : null}
                      </View>
                      <View style={styles.planText}>
                        <Text style={styles.planLabel}>{item.label}</Text>
                        <Text style={styles.planPer}>{item.per}</Text>
                      </View>
                      <Text style={styles.planPrice}>{item.price}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={styles.activeCard}>
              <Ionicons name="checkmark-circle" size={20} color={palette.success} />
              <Text style={styles.activeText}>You’re on the {getPlan(activePlan ?? 'yearly').label} plan.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {isPremium ? (
          <GradientButton label="Done" onPress={dismiss} style={styles.cta} />
        ) : (
          <>
            <GradientButton
              label={`Continue · ${getPlan(selected).price}`}
              onPress={() => router.push({ pathname: '/premium/checkout', params: { plan: selected } })}
              style={styles.cta}
            />
            <Text style={styles.fineprint}>Recurring billing. Cancel anytime. Terms apply.</Text>
          </>
        )}
      </View>
    </View>
  );
}

function BenefitRow({ benefit }: { benefit: PremiumBenefit }) {
  return (
    <View style={styles.benefitRow}>
      <View style={styles.benefitIcon}>
        <Ionicons name={benefit.icon} size={20} color={palette.primary} />
      </View>
      <View style={styles.benefitText}>
        <Text style={styles.benefitTitle}>{benefit.title}</Text>
        <Text style={styles.benefitSubtitle}>{benefit.subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  close: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 20,
  },
  hero: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  crown: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: typography.title,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: typography.subtitle,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: palette.chipSurfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: typography.body,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  benefitSubtitle: {
    fontSize: typography.caption,
    fontWeight: '500',
    color: palette.textSecondary,
    lineHeight: 18,
  },
  plans: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  planCard: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    padding: spacing.md,
  },
  planCardActive: {
    borderColor: palette.primary,
    backgroundColor: palette.chipSurfaceSoft,
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    left: spacing.md,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: palette.premiumAccent,
  },
  planBadgeText: {
    fontSize: typography.label,
    fontWeight: '800',
    color: '#ffffff',
  },
  planMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: palette.primary,
    backgroundColor: palette.primary,
  },
  planText: {
    flex: 1,
  },
  planLabel: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  planPer: {
    fontSize: typography.caption,
    fontWeight: '500',
    color: palette.textSecondary,
  },
  planPrice: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: palette.chipSurfaceSoft,
  },
  activeText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    backgroundColor: palette.background,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    gap: spacing.xs,
  },
  cta: {
    alignSelf: 'stretch',
  },
  fineprint: {
    fontSize: typography.label,
    fontWeight: '500',
    color: palette.textSecondary,
    textAlign: 'center',
  },
});
