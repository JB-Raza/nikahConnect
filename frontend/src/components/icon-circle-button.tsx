import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors, shadow } from '@/theme/theme';

const palette = colors.light;

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type Variant = 'onDark' | 'onLight' | 'surface';

const VARIANTS: Record<Variant, { bg: string; border: string; defaultColor: string }> = {
  onDark: {
    bg: 'rgba(255,255,255,0.16)',
    border: 'rgba(255,255,255,0.28)',
    defaultColor: 'rgba(255,255,255,0.94)',
  },
  onLight: {
    bg: 'rgba(23,32,28,0.07)',
    border: 'rgba(23,32,28,0.12)',
    defaultColor: palette.textPrimary,
  },
  surface: {
    bg: 'rgba(255,255,255,0.92)',
    border: 'rgba(23,32,28,0.1)',
    defaultColor: palette.textPrimary,
  },
};

export default function IconCircleButton({
  icon,
  onPress,
  size = 44,
  iconSize = 22,
  color,
  variant = 'onLight',
  accessibilityLabel,
  style,
  disabled,
}: {
  icon: IoniconName;
  onPress: () => void;
  size?: number;
  iconSize?: number;
  color?: string;
  variant?: Variant;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  const theme = VARIANTS[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={6}
      style={({ pressed }) => [
        styles.button,
        variant === 'surface' && styles.surfaceShadow,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.bg,
          borderColor: theme.border,
          opacity: disabled ? 0.45 : pressed ? 0.9 : 1,
          transform: [{ scale: pressed && !disabled ? 0.92 : 1 }],
        },
        style,
      ]}>
      <Ionicons name={icon} size={iconSize} color={color ?? theme.defaultColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  surfaceShadow: {
    ...shadow.sm,
  },
});
