import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { colors, letterSpacing } from '@/theme/theme';

const palette = colors.light;
const LOGO_SIZE = 200;

type AnimatedSplashProps = {
  /** Called once the exit fade-out finishes, so the host can unmount the overlay. */
  onFinish: () => void;
  /** Fires on first layout, used to hand off from the native splash without a flash. */
  onLayout?: () => void;
};

/**
 * Full-screen branded splash overlay. The native splash is just a flat white
 * screen (no image), so this overlay owns ALL the branding: it fades/scales the
 * logo in, then the app name rises in beneath it, then the whole thing fades out.
 * Because the native splash and this overlay share the same white background, the
 * handoff between them is invisible — it reads as a single splash.
 *
 * The logo and the name live on separate absolutely-positioned layers, so the
 * name fading in never shifts the logo away from the exact screen centre.
 */
export default function AnimatedSplash({ onFinish, onLayout }: AnimatedSplashProps) {
  const containerOpacity = useSharedValue(1);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.88);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(10);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) });
    logoScale.value = withTiming(1, { duration: 640, easing: Easing.out(Easing.back(1.3)) });

    textOpacity.value = withDelay(420, withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) }));
    textTranslateY.value = withDelay(420, withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) }));

    containerOpacity.value = withDelay(
      1650,
      withTiming(0, { duration: 420, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      }),
    );
  }, [containerOpacity, logoOpacity, logoScale, textOpacity, textTranslateY, onFinish]);

  const containerStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]} onLayout={onLayout}>
      <View style={styles.logoLayer} pointerEvents="none">
        <Animated.Image source={require('../../assets/logo.png')} style={[styles.logo, logoStyle]} resizeMode="contain" />
      </View>

      <Animated.View style={[styles.textLayer, textStyle]} pointerEvents="none">
        <View style={styles.nameRow}>
          <Text style={styles.nameAccent}>Nikah</Text>
          <Text style={styles.name}> Connect</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 10,
  },
  // Perfectly centres the logo in the full screen, matching the native splash.
  logoLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  // Sits just below the centred logo without affecting the logo's position.
  textLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    marginTop: LOGO_SIZE / 2 - 8,
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 30,
    fontWeight: '800',
    color: palette.textPrimary,
    letterSpacing: letterSpacing.snug,
  },
  nameAccent: {
    fontSize: 30,
    fontWeight: '800',
    color: palette.primary,
    letterSpacing: letterSpacing.snug,
  },
});
