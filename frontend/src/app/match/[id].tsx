import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getLikerById, matches } from '@/features/likes/data';
import { currentUser } from '@/features/menu/data';
import { getProfileById } from '@/features/profiles/data';
import { radius, spacing, typography } from '@/theme/theme';

export default function MatchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const liker = getLikerById(id);
  const profile = getProfileById(id);
  const name = liker?.name ?? profile.name;
  const photo = liker?.photo ?? profile.photos[0];
  const chatId = matches.find((match) => match.id === id)?.chatId ?? 'c1';

  const scale = useMemo(() => new Animated.Value(0.6), []);
  const opacity = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  const dismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/marriage');
    }
  };

  const goToChat = () => {
    if (router.canGoBack()) {
      router.back();
    }
    router.push(`/chat/${chatId}`);
  };

  return (
    <View style={styles.screen}>
      <LinearGradient colors={['#0f5c37', '#177245', '#09120e']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />

      <Pressable onPress={dismiss} hitSlop={10} style={[styles.close, { top: insets.top + spacing.sm }]} accessibilityLabel="Close">
        <Ionicons name="close" size={26} color="rgba(255,255,255,0.9)" />
      </Pressable>

      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.kicker}>IT’S A MATCH!</Text>
        <Text style={styles.subtitle}>You and {name} liked each other</Text>

        <View style={styles.avatarsRow}>
          <Image source={currentUser.photo} style={[styles.avatar, styles.avatarLeft]} resizeMode="cover" />
          <Image source={photo} style={[styles.avatar, styles.avatarRight]} resizeMode="cover" />
          <View style={styles.heartBadge}>
            <Ionicons name="heart" size={26} color="#ffffff" />
          </View>
        </View>

        <Text style={styles.note}>Make the first move and start with a warm salam.</Text>
      </Animated.View>

      <View style={[styles.actions, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Pressable style={styles.primaryButton} onPress={goToChat}>
          <Ionicons name="chatbubble" size={18} color="#177245" />
          <Text style={styles.primaryText}>Send a message</Text>
        </Pressable>
        <Pressable style={styles.ghostButton} onPress={dismiss}>
          <Text style={styles.ghostText}>Keep browsing</Text>
        </Pressable>
      </View>
    </View>
  );
}

const AVATAR = 132;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#09120e',
  },
  close: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 2,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  kicker: {
    fontSize: 40,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: radius.pill,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: '#1f2a16',
  },
  avatarLeft: {
    marginRight: -spacing.lg,
    transform: [{ rotate: '-6deg' }],
  },
  avatarRight: {
    marginLeft: -spacing.lg,
    transform: [{ rotate: '6deg' }],
  },
  heartBadge: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: '#177245',
    borderWidth: 3,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: {
    fontSize: typography.body,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  actions: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: typography.button,
    fontWeight: '800',
    color: '#177245',
  },
  ghostButton: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    fontSize: typography.button,
    fontWeight: '700',
    color: '#ffffff',
  },
});
