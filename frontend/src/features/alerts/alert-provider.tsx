import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, FadeOutUp, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@/theme/theme';

const palette = colors.light;

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';
export type AlertButtonStyle = 'default' | 'cancel' | 'destructive';

export type AlertButton = {
  text: string;
  style?: AlertButtonStyle;
  onPress?: () => void;
};

export type AlertOptions = {
  type?: AlertType;
  title: string;
  message?: string;
  buttons?: AlertButton[];
};

export type ConfirmOptions = {
  type?: AlertType;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastOptions = {
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
};

export type MatchAlertOptions = {
  name: string;
  onChat: () => void;
  onBrowse?: () => void;
};

type AlertApi = {
  showAlert: (options: AlertOptions) => void;
  showMatch: (options: MatchAlertOptions) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  showToast: (options: ToastOptions) => void;
};

const AlertContext = createContext<AlertApi | null>(null);

const TYPE_CONFIG: Record<AlertType, { icon: React.ComponentProps<typeof Ionicons>['name']; color: string; gradient: readonly [string, string] }> = {
  success: { icon: 'checkmark-done', color: palette.success, gradient: ['#22a866', '#15643c'] },
  error: { icon: 'close', color: palette.danger, gradient: ['#e0584f', '#a8261f'] },
  warning: { icon: 'alert', color: palette.warning, gradient: ['#e3a53c', '#a4610f'] },
  info: { icon: 'information', color: palette.primary, gradient: ['#3a9bef', '#155fa8'] },
  confirm: { icon: 'help', color: palette.primary, gradient: ['#3a9bef', '#155fa8'] },
};

const MATCH_GRADIENT: readonly [string, string] = ['#3a9bef', '#155fa8'];

const TOAST_CONFIG: Record<ToastType, { icon: React.ComponentProps<typeof Ionicons>['name']; color: string }> = {
  success: { icon: 'checkmark-circle', color: palette.success },
  error: { icon: 'alert-circle', color: palette.danger },
  warning: { icon: 'warning', color: palette.warning },
  info: { icon: 'information-circle', color: palette.primary },
};

type DialogState = AlertOptions & { id: number };
type MatchDialogState = MatchAlertOptions & { id: number };
type ToastState = ToastOptions & { id: number };

const cardEntering = () => {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ scale: 0.88 }, { translateY: 14 }] },
    animations: {
      opacity: withTiming(1, { duration: 150 }),
      transform: [
        { scale: withSpring(1, { damping: 15, stiffness: 190, mass: 0.7 }) },
        { translateY: withSpring(0, { damping: 16, stiffness: 190, mass: 0.7 }) },
      ],
    },
  };
};
const CARD_EXIT = FadeOut.duration(130);

export default function AlertProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [matchDialog, setMatchDialog] = useState<MatchDialogState | null>(null);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const counter = useRef(0);

  const closeDialog = useCallback(() => setDialog(null), []);
  const closeMatchDialog = useCallback(() => setMatchDialog(null), []);

  const showAlert = useCallback((options: AlertOptions) => {
    counter.current += 1;
    setDialog({ ...options, id: counter.current });
  }, []);

  const showMatch = useCallback((options: MatchAlertOptions) => {
    counter.current += 1;
    setMatchDialog({ ...options, id: counter.current });
  }, []);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        counter.current += 1;
        setDialog({
          id: counter.current,
          type: options.type ?? 'confirm',
          title: options.title,
          message: options.message,
          buttons: [
            { text: options.cancelText ?? 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            {
              text: options.confirmText ?? 'Confirm',
              style: options.destructive ? 'destructive' : 'default',
              onPress: () => resolve(true),
            },
          ],
        });
      }),
    [],
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      counter.current += 1;
      const id = counter.current;
      setToasts((current) => [...current, { ...options, id }]);
      setTimeout(() => dismissToast(id), options.duration ?? 2600);
    },
    [dismissToast],
  );

  const api = useMemo<AlertApi>(() => ({ showAlert, showMatch, confirm, showToast }), [showAlert, showMatch, confirm, showToast]);

  const buttons = dialog?.buttons?.length ? dialog.buttons : [{ text: 'OK' } as AlertButton];
  const isRow = buttons.length === 2;
  const scrollActions = buttons.length > 3;
  const config = TYPE_CONFIG[dialog?.type ?? 'info'];

  const runButton = (button: AlertButton) => {
    closeDialog();
    button.onPress?.();
  };

  const handleBackdrop = () => {
    const cancelButton = buttons.find((button) => button.style === 'cancel');
    if (cancelButton) {
      runButton(cancelButton);
    } else {
      closeDialog();
    }
  };

  const runMatchButton = (onPress?: () => void) => {
    closeMatchDialog();
    onPress?.();
  };

  return (
    <AlertContext.Provider value={api}>
      {children}

      <Modal transparent visible={dialog !== null} animationType="fade" statusBarTranslucent onRequestClose={handleBackdrop}>
        {dialog ? (
          <View style={styles.modalRoot}>
            <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdrop}>
              <BlurView intensity={45} tint="dark" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />
              <View style={styles.backdropTint} />
            </Pressable>

            <Animated.View entering={cardEntering} exiting={CARD_EXIT} style={styles.cardContainer}>
              <View style={styles.card}>
                <BlurView intensity={70} tint="light" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />
                <View style={styles.cardTint} />

                <View style={styles.cardContent}>
                  <Text style={styles.title}>{dialog.title}</Text>
                  {dialog.message ? <Text style={styles.message}>{dialog.message}</Text> : null}

                  {scrollActions ? (
                    <ScrollView style={styles.actionsScroll} contentContainerStyle={[styles.actions, styles.actionsColumn]} bounces={false}>
                      {buttons.map((button, index) => (
                        <DialogButton key={`${button.text}-${index}`} button={button} flex={false} onPress={() => runButton(button)} />
                      ))}
                    </ScrollView>
                  ) : (
                    <View style={[styles.actions, isRow ? styles.actionsRow : styles.actionsColumn]}>
                      {buttons.map((button, index) => (
                        <DialogButton key={`${button.text}-${index}`} button={button} flex={isRow} onPress={() => runButton(button)} />
                      ))}
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.badgeWrap} pointerEvents="none">
                <LinearGradient colors={config.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.badge}>
                  <Ionicons name={config.icon} size={30} color="#ffffff" />
                </LinearGradient>
              </View>
            </Animated.View>
          </View>
        ) : null}
      </Modal>

      <Modal transparent visible={matchDialog !== null} animationType="fade" statusBarTranslucent onRequestClose={closeMatchDialog}>
        {matchDialog ? (
          <View style={styles.modalRoot}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeMatchDialog}>
              <BlurView intensity={45} tint="dark" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />
              <View style={styles.backdropTint} />
            </Pressable>

            <Animated.View entering={cardEntering} exiting={CARD_EXIT} style={styles.cardContainer}>
              <View style={styles.card}>
                <BlurView intensity={70} tint="light" experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />
                <View style={styles.cardTint} />

                <View style={styles.cardContent}>
                  <Text style={styles.matchKicker}>It&apos;s a match!</Text>
                  <Text style={styles.title}>You and {matchDialog.name} liked each other</Text>
                  <Text style={styles.message}>Make the first move and start with a warm salam.</Text>

                  <View style={[styles.actions, styles.actionsColumn]}>
                    <DialogButton
                      button={{ text: 'Send a message', style: 'default' }}
                      flex={false}
                      onPress={() => runMatchButton(matchDialog.onChat)}
                    />
                    <DialogButton
                      button={{ text: 'Continue browsing', style: 'cancel' }}
                      flex={false}
                      onPress={() => runMatchButton(matchDialog.onBrowse)}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.badgeWrap} pointerEvents="none">
                <LinearGradient colors={MATCH_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.badge}>
                  <Ionicons name="heart" size={30} color="#ffffff" />
                </LinearGradient>
              </View>
            </Animated.View>
          </View>
        ) : null}
      </Modal>

      <SafeAreaInsetsContext.Consumer>
        {(insets) => (
          <View pointerEvents="box-none" style={[styles.toastWrap, { top: (insets?.top ?? 0) + spacing.xs }]}>
            {toasts.map((toast) => (
              <ToastCard key={toast.id} toast={toast} onPress={() => dismissToast(toast.id)} />
            ))}
          </View>
        )}
      </SafeAreaInsetsContext.Consumer>
    </AlertContext.Provider>
  );
}

function DialogButton({ button, flex, onPress }: { button: AlertButton; flex: boolean; onPress: () => void }) {
  const style = button.style ?? 'default';
  const isPrimary = style === 'default';
  const isDestructive = style === 'destructive';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        flex && styles.buttonFlex,
        isPrimary && { backgroundColor: pressed ? palette.primaryPressed : palette.primary },
        isDestructive && { backgroundColor: pressed ? '#a52a2a' : palette.danger },
        style === 'cancel' && [styles.buttonGhost, pressed && { backgroundColor: palette.chipSurfaceSoft }],
      ]}>
      <Text
        style={[
          styles.buttonText,
          isPrimary && styles.buttonTextOnFill,
          isDestructive && styles.buttonTextOnFill,
          style === 'cancel' && styles.buttonTextGhost,
        ]}>
        {button.text}
      </Text>
    </Pressable>
  );
}

function ToastCard({ toast, onPress }: { toast: ToastState; onPress: () => void }) {
  const config = TOAST_CONFIG[toast.type ?? 'info'];
  return (
    <Animated.View entering={FadeInDown.duration(220)} exiting={FadeOutUp.duration(180)} style={styles.toastShadow}>
      <Pressable onPress={onPress} style={styles.toast}>
        <Ionicons name={config.icon} size={20} color={config.color} />
        <View style={styles.toastTextWrap}>
          {toast.title ? <Text style={styles.toastTitle}>{toast.title}</Text> : null}
          <Text style={styles.toastMessage} numberOfLines={2}>
            {toast.message}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function useAlert(): AlertApi {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  backdropTint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 16, 26, 0.18)',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 326,
    marginTop: 30,
    shadowColor: '#0a1422',
    shadowOpacity: 0.24,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 14 },
    elevation: 16,
  },
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.65)',
  },
  cardTint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
  },
  cardContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: 42,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  badgeWrap: {
    position: 'absolute',
    top: -30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#0a1422',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  title: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '800',
    color: palette.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: spacing.xxs,
  },
  actions: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
  },
  actionsColumn: {
    flexDirection: 'column',
  },
  actionsScroll: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
    maxHeight: 260,
  },
  matchKicker: {
    fontSize: typography.caption,
    fontWeight: '800',
    color: palette.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xxs,
  },
  button: {
    minHeight: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  buttonFlex: {
    flex: 1,
  },
  buttonGhost: {
    backgroundColor: palette.chipSurfaceSoft,
  },
  buttonText: {
    fontSize: typography.button,
    fontWeight: '700',
  },
  buttonTextOnFill: {
    color: palette.textOnPrimary,
  },
  buttonTextGhost: {
    color: palette.textPrimary,
  },
  toastWrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    gap: spacing.xs,
    alignItems: 'center',
  },
  toastShadow: {
    width: '100%',
    maxWidth: 460,
    shadowColor: '#0b1f16',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  toastTextWrap: {
    flex: 1,
  },
  toastTitle: {
    fontSize: typography.caption,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  toastMessage: {
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textPrimary,
  },
});
