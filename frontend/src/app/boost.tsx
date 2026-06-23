import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GradientButton from '@/components/gradient-button';
import { colors, radius, spacing, typography } from '@/theme/theme';

const palette = colors.light;

type BoostPack = { id: string; count: number; price: string; per: string; tag?: string };

const PACKS: BoostPack[] = [
  { id: '1', count: 1, price: '$3.99', per: '$3.99 each' },
  { id: '5', count: 5, price: '$14.99', per: '$3.00 each', tag: 'Popular' },
  { id: '10', count: 10, price: '$24.99', per: '$2.50 each', tag: 'Best value' },
];

export default function BoostScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState('5');
  const [boosting, setBoosting] = useState(false);

  const translateY = useMemo(() => new Animated.Value(400), []);

  useEffect(() => {
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 4 }).start();
  }, [translateY]);

  const dismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/marriage');
    }
  };

  const boostNow = () => {
    setBoosting(true);
    setTimeout(() => {
      setBoosting(false);
      dismiss();
    }, 1100);
  };

  const pack = PACKS.find((item) => item.id === selected) ?? PACKS[1];

  return (
    <View style={styles.screen}>
      <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />

      <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg, transform: [{ translateY }] }]}>
        <View style={styles.handle} />

        <LinearGradient colors={['#1a6fc0', '#2486e0']} style={styles.boostIcon}>
          <Ionicons name="flash" size={28} color="#ffffff" />
        </LinearGradient>

        <Text style={styles.title}>Boost your profile</Text>
        <Text style={styles.subtitle}>
          Be one of the top profiles in your area for 30 minutes and get seen by up to 10x more people.
        </Text>

        <View style={styles.packs}>
          {PACKS.map((item) => {
            const active = selected === item.id;
            return (
              <Pressable key={item.id} style={[styles.pack, active && styles.packActive]} onPress={() => setSelected(item.id)}>
                {item.tag ? (
                  <View style={styles.packTag}>
                    <Text style={styles.packTagText}>{item.tag}</Text>
                  </View>
                ) : null}
                <Text style={[styles.packCount, active && { color: palette.primary }]}>{item.count}</Text>
                <Text style={styles.packCountLabel}>{item.count === 1 ? 'Boost' : 'Boosts'}</Text>
                <Text style={styles.packPrice}>{item.price}</Text>
                <Text style={styles.packPer}>{item.per}</Text>
              </Pressable>
            );
          })}
        </View>

        <GradientButton
          label={boosting ? 'Boosting…' : `Boost now · ${pack.price}`}
          icon="flash"
          onPress={boostNow}
          disabled={boosting}
          style={styles.cta}
        />

        <Pressable style={styles.premiumLink} onPress={() => router.replace('/premium')}>
          <Ionicons name="diamond" size={14} color={palette.premiumAccent} />
          <Text style={styles.premiumLinkText}>Premium includes a free Boost every week</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'rgba(8,16,24,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: palette.border,
    marginBottom: spacing.lg,
  },
  boostIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.titleMd,
    fontWeight: '900',
    color: palette.textPrimary,
  },
  subtitle: {
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  packs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  pack: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  packActive: {
    borderColor: palette.primary,
    backgroundColor: palette.chipSurfaceSoft,
  },
  packTag: {
    position: 'absolute',
    top: -10,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: palette.premiumAccent,
  },
  packTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
  packCount: {
    fontSize: typography.title,
    fontWeight: '900',
    color: palette.textPrimary,
  },
  packCountLabel: {
    fontSize: typography.label,
    fontWeight: '700',
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  packPrice: {
    fontSize: typography.body,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  packPer: {
    fontSize: typography.label,
    fontWeight: '500',
    color: palette.textSecondary,
  },
  cta: {
    alignSelf: 'stretch',
  },
  premiumLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  premiumLinkText: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.premiumAccent,
  },
});
