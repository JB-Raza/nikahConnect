import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { colors, gradients, radius, shadow, sizing, spacing, typography } from '@/theme/theme';

const palette = colors.light;

type GradientButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

type GradientButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Visual emphasis. `primary` keeps the solid brand gradient (default). */
  variant?: GradientButtonVariant;
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
  variant = 'primary',
  style,
  textStyle,
  accessibilityLabel,
}: GradientButtonProps) {
  const isInactive = disabled || loading;
  const isSolid = variant === 'primary' || variant === 'secondary';
  const contentTint = variant === 'primary' ? palette.textOnPrimary : palette.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      style={({ pressed }) => [
        styles.container,
        isInactive && styles.containerInactive,
        style,
        { transform: [{ scale: pressed && !isInactive ? 0.98 : 1 }] },
      ]}>
      {({ pressed }) => (
        <Body
          variant={variant}
          isSolid={isSolid}
          isInactive={isInactive}
          disabled={disabled}
          pressed={pressed}
          shadow={variant === 'primary'}>
          {loading ? (
            <ActivityIndicator color={contentTint} />
          ) : (
            <>
              {icon ? <Ionicons name={icon} size={typography.subtitle} color={contentTint} /> : null}
              <Text style={[styles.label, { color: contentTint }, textStyle]}>{label}</Text>
            </>
          )}
        </Body>
      )}
    </Pressable>
  );
}

function Body({
  variant,
  isSolid,
  isInactive,
  disabled,
  pressed,
  shadow: showShadow,
  children,
}: {
  variant: GradientButtonVariant;
  isSolid: boolean;
  isInactive: boolean;
  disabled: boolean;
  pressed: boolean;
  shadow?: boolean;
  children: React.ReactNode;
}) {
  const bodyStyle = [styles.body, showShadow && styles.bodyShadow];

  if (isSolid) {
    const colorsForState =
      isInactive && disabled
        ? DISABLED_GRADIENT
        : variant === 'secondary'
          ? pressed
            ? SECONDARY_PRESSED
            : SECONDARY_GRADIENT
          : pressed
            ? gradients.buttonPressed
            : gradients.button;
    return (
      <LinearGradient colors={colorsForState} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={bodyStyle}>
        {variant === 'primary' ? (
          <LinearGradient
            colors={SHEEN_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.sheen}
            pointerEvents="none"
          />
        ) : null}
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.body,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        pressed && !isInactive && styles.flatPressed,
      ]}>
      {children}
    </View>
  );
}

const DISABLED_GRADIENT = [palette.tabBarInactive, palette.tabBarInactive] as const;
const SECONDARY_GRADIENT = [palette.primary50, palette.primary100] as const;
const SECONDARY_PRESSED = [palette.primary100, palette.primary50] as const;
// Soft top highlight that fades to nothing — gives a subtle 3D sheen with no hard seam.
const SHEEN_GRADIENT = ['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)'] as const;

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    width: '100%',
  },
  containerInactive: {
    opacity: 0.9,
  },
  body: {
    width: '100%',
    alignSelf: 'stretch',
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  bodyShadow: {
    ...shadow.md,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  outline: {
    borderWidth: 1.5,
    borderColor: palette.primaryTint,
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: palette.chipSurfaceSoft,
  },
  flatPressed: {
    backgroundColor: palette.primary50,
  },
  label: {
    fontSize: typography.button,
    fontWeight: '700',
    color: palette.textOnPrimary,
  },
});
