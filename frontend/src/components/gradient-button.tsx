import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { colors, gradients, radius, sizing, spacing, typography } from '@/theme/theme';

const palette = colors.light;

type GradientButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Extra styles for the outer container (e.g. `flex: 1`, `alignSelf: 'stretch'`). */
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
};

/**
 * Primary call-to-action button with a soft vertical brand gradient for a subtle 3D look.
 * Drop-in replacement for the solid `palette.primary` buttons used across the app.
 */
export default function GradientButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  accessibilityLabel,
}: GradientButtonProps) {
  const isInactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      style={({ pressed }) => [
        styles.container,
        style,
        { transform: [{ scale: pressed && !isInactive ? 0.98 : 1 }] },
      ]}>
      {({ pressed }) => (
        <LinearGradient
          colors={isInactive && disabled ? DISABLED_GRADIENT : pressed ? gradients.primaryPressed : gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradient}>
          {loading ? (
            <ActivityIndicator color={palette.textOnPrimary} />
          ) : (
            <>
              {icon ? <Ionicons name={icon} size={typography.subtitle} color={palette.textOnPrimary} /> : null}
              <Text style={[styles.label, textStyle]}>{label}</Text>
            </>
          )}
        </LinearGradient>
      )}
    </Pressable>
  );
}

const DISABLED_GRADIENT = [palette.tabBarInactive, palette.tabBarInactive] as const;

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    overflow: 'hidden',
    shadowColor: '#0c3d6b',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  gradient: {
    minHeight: sizing.buttonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  label: {
    fontSize: typography.button,
    fontWeight: '700',
    color: palette.textOnPrimary,
  },
});
