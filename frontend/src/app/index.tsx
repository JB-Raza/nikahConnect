import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import IntroActions from '@/features/intro/intro-actions';
import ProgressDots from '@/features/intro/progress-dots';
import { introSlides } from '@/features/intro/slides';
import BrandLogo from '@/components/brand-logo';
import { spacing, typography } from '@/theme/theme';

export default function IntroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<(typeof introSlides)[number]>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === introSlides.length - 1;
  const activeSlide = introSlides[activeIndex];

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(Math.min(Math.max(index, 0), introSlides.length - 1));
  };

  const handleNext = () => {
    const nextIndex = Math.min(activeIndex + 1, introSlides.length - 1);
    listRef.current?.scrollToIndex({ animated: true, index: nextIndex });
    setActiveIndex(nextIndex);
  };

  const goToAuth = () => router.push('/auth');

  return (
    <View style={styles.screen}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <FlatList
        ref={listRef}
        data={introSlides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Image source={item.image} style={{ width, height }} resizeMode="cover" />}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
      />

      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.92)']}
        locations={[0, 0.28, 0.5, 0.92]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]} pointerEvents="box-none">
        <View style={styles.brandRow}>
          <BrandLogo size={28} />
          <Text style={styles.brandText}>NikahConnect</Text>
        </View>

        {!isLastSlide ? (
          <Pressable onPress={goToAuth} hitSlop={8} style={styles.skipPill}>
            <Text style={styles.skipText}>Skip</Text>
            <Ionicons name="arrow-forward" size={13} color="#ffffff" />
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{activeSlide.badge}</Text>
        </View>
        <Text style={styles.title}>{activeSlide.title}</Text>
        <Text style={styles.description}>{activeSlide.description}</Text>

        <ProgressDots total={introSlides.length} activeIndex={activeIndex} />

        <IntroActions isLastSlide={isLastSlide} onNext={handleNext} onGetStarted={goToAuth} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  brandText: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  skipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  skipText: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: '#ffffff',
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: spacing.md,
  },
  badgeText: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 38,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.subtitle,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 23,
    marginBottom: spacing.lg,
  },
});
