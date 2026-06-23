import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GradientButton from '@/components/gradient-button';
import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

const palette = colors.light;

type AuthScaffoldProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthScaffold({ title, subtitle, onBack, children, footer }: AuthScaffoldProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[authStyles.screen, { paddingTop: insets.top + spacing.xs }]}>
      <KeyboardAvoidingView style={authStyles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={authStyles.topBar}>
          {onBack ? (
            <Pressable onPress={onBack} hitSlop={10} style={authStyles.backButton} accessibilityLabel="Go back">
              <Ionicons name="chevron-back" size={26} color={palette.textPrimary} />
            </Pressable>
          ) : (
            <View style={authStyles.backButton} />
          )}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={authStyles.scrollContent}>
          <Text style={authStyles.title}>{title}</Text>
          {subtitle ? <Text style={authStyles.subtitle}>{subtitle}</Text> : null}
          <View style={authStyles.body}>{children}</View>
        </ScrollView>

        {footer ? <View style={[authStyles.footer, { paddingBottom: insets.bottom + spacing.md }]}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </View>
  );
}

type AuthFieldProps = TextInputProps & {
  label: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  error?: string;
  secure?: boolean;
};

export function AuthField({ label, icon, error, secure, ...props }: AuthFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(Boolean(secure));

  return (
    <View style={authStyles.fieldWrap}>
      <Text style={authStyles.fieldLabel}>{label}</Text>
      <View
        style={[
          authStyles.fieldBox,
          focused && authStyles.fieldBoxFocused,
          error ? authStyles.fieldBoxError : null,
        ]}>
        {icon ? <Ionicons name={icon} size={18} color={palette.textSecondary} style={authStyles.fieldIcon} /> : null}
        <TextInput
          {...props}
          secureTextEntry={hidden}
          placeholderTextColor={palette.textSecondary}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
          style={authStyles.fieldInput}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((value) => !value)} hitSlop={8} style={authStyles.fieldTrailing}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={18} color={palette.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={authStyles.fieldError}>{error}</Text> : null}
    </View>
  );
}

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
};

export function PrimaryButton({ label, onPress, loading, disabled, icon }: PrimaryButtonProps) {
  return (
    <GradientButton
      label={label}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      icon={icon}
      style={authStyles.primaryButton}
    />
  );
}

export function SocialButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [authStyles.socialButton, pressed && { opacity: 0.85 }]}>
      <Ionicons name={icon} size={20} color={palette.textPrimary} />
      <Text style={authStyles.socialLabel}>{label}</Text>
    </Pressable>
  );
}

export function OrDivider({ label = 'or' }: { label?: string }) {
  return (
    <View style={authStyles.dividerRow}>
      <View style={authStyles.dividerLine} />
      <Text style={authStyles.dividerText}>{label}</Text>
      <View style={authStyles.dividerLine} />
    </View>
  );
}

export function TextLink({ prefix, action, onPress }: { prefix?: string; action: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={authStyles.linkRow}>
      {prefix ? <Text style={authStyles.linkPrefix}>{prefix} </Text> : null}
      <Text style={authStyles.linkAction}>{action}</Text>
    </Pressable>
  );
}

export const authPalette = palette;

const authStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: spacing.md,
    height: 44,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: typography.title,
    lineHeight: 38,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  subtitle: {
    fontSize: typography.subtitle,
    lineHeight: 23,
    fontWeight: '500',
    color: palette.textSecondary,
    marginTop: spacing.xs,
  },
  body: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  fieldWrap: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  fieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  fieldBoxFocused: {
    borderColor: palette.primary,
  },
  fieldBoxError: {
    borderColor: palette.danger,
  },
  fieldIcon: {
    marginRight: spacing.xxs,
  },
  fieldInput: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '600',
    color: palette.textPrimary,
    paddingVertical: spacing.sm,
  },
  fieldTrailing: {
    paddingLeft: spacing.xs,
  },
  fieldError: {
    fontSize: typography.label,
    fontWeight: '600',
    color: palette.danger,
  },
  primaryButton: {
    alignSelf: 'stretch',
  },
  socialButton: {
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  socialLabel: {
    fontSize: typography.button,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: palette.border,
  },
  dividerText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  linkPrefix: {
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
  },
  linkAction: {
    fontSize: typography.body,
    fontWeight: '800',
    color: palette.primary,
  },
});
