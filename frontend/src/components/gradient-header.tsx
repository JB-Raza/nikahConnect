import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import IconCircleButton from '@/components/icon-circle-button';
import { gradients, shadow, spacing, typography } from '@/theme/theme';

type GradientHeaderProps = {
  title: string;
  /** When provided, shows a left icon button that calls this handler. */
  onBack?: () => void;
  /** Icon for the left button (e.g. 'close' for modals). Defaults to a back chevron. */
  backIcon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Optional element rendered on the right side of the title row. */
  right?: React.ReactNode;
  /** Title alignment. Stack/detail screens read best centered; tab roots left. */
  align?: 'left' | 'center';
  /** Extra content (filter chips, tab strips, segments) rendered inside the band. */
  children?: React.ReactNode;
  /** Style overrides for the region wrapping `children`. */
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Shared brand-blue header band used across fixed-header screens. It paints a subtle
 * gradient up under the status bar (translucent) and flips the status-bar icons to
 * light — but only while the screen is focused, so the light icons never leak onto
 * other (light-background) screens in the stack/tabs.
 */
export default function GradientHeader({
  title,
  onBack,
  backIcon = 'chevron-back',
  right,
  align = 'left',
  children,
  contentStyle,
}: GradientHeaderProps) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const centered = align === 'center';

  return (
    <>
      {isFocused ? <StatusBar translucent backgroundColor="transparent" barStyle="light-content" /> : null}
      <LinearGradient
        colors={gradients.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.band, { paddingTop: insets.top + spacing.xs }]}>
        <View style={styles.titleRow}>
          {onBack ? (
            <IconCircleButton
              icon={backIcon}
              onPress={onBack}
              variant="onDark"
              size={38}
              iconSize={24}
              accessibilityLabel="Go back"
            />
          ) : (
            <View style={styles.side} />
          )}

          <Text
            style={[styles.title, centered ? styles.titleCentered : styles.titleLeft]}
            numberOfLines={1}>
            {title}
          </Text>

          <View style={[styles.side, styles.sideRight]}>{right}</View>
        </View>

        {children ? <View style={contentStyle}>{children}</View> : null}
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  band: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    ...shadow.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
  },
  side: {
    minWidth: 38,
    height: 38,
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: typography.titleMd,
    fontWeight: '800',
    color: '#ffffff',
  },
  titleLeft: {
    flex: 1,
  },
  titleCentered: {
    flex: 1,
    textAlign: 'center',
  },
});
