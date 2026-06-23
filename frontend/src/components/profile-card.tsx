import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import VerifiedStar from '@/components/verified-star';
import { colors, radius, spacing, typography } from '@/theme/theme';

const palette = colors.light;
const CARD_RATIO = 1.34;

type ProfileCardProps = {
  name: string;
  age: number;
  city: string;
  activeLabel: string;
  photo: ImageSourcePropType;
  width: number;
  isVerified?: boolean;
  isOnline?: boolean;
  onPress?: () => void;
};

export default function ProfileCard({
  name,
  age,
  city,
  activeLabel,
  photo,
  width,
  isVerified,
  isOnline,
  onPress,
}: ProfileCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { width, height: Math.round(width * CARD_RATIO), opacity: pressed ? 0.92 : 1 },
      ]}>
      <Image source={photo} style={StyleSheet.absoluteFill} resizeMode="cover" />

      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.82)']}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
      />

      {isOnline ? (
        <View style={styles.onlinePill}>
          <View style={styles.onlineDot} />
        </View>
      ) : null}

      <View style={styles.cardBody}>
        <View style={styles.nameRow}>
          <Text style={styles.nameText} numberOfLines={1}>
            {name}
            <Text style={styles.ageText}>{`  ${age}`}</Text>
          </Text>
          {isVerified ? <VerifiedStar size={14} /> : null}
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={11} color="rgba(255,255,255,0.85)" />
          <Text style={styles.metaText} numberOfLines={1}>
            {city}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#46d17f' : 'rgba(255,255,255,0.55)' }]} />
          <Text style={styles.metaText} numberOfLines={1}>
            {activeLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: palette.chipSurfaceSoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.cardBorder,
  },
  onlinePill: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 16,
    height: 16,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: '#46d17f',
  },
  cardBody: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  nameText: {
    flexShrink: 1,
    fontSize: typography.body,
    fontWeight: '800',
    color: '#ffffff',
  },
  ageText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  metaText: {
    flexShrink: 1,
    fontSize: typography.label,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: radius.pill,
  },
});
