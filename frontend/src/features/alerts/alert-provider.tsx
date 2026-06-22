import { Ionicons } from '@expo/vector-icons';
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, FadeOutUp, SlideInDown, SlideOutDown, withSpring, withTiming } from 'react-native-reanimated';
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

export type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export type ActionSheetAction = {
  label: string;
  icon?: IoniconName;
  style?: 'default' | 'destructive';
  onPress?: () => void;
};

export type ActionSheetOptions = {
  title?: string;
  message?: string;
  actions: ActionSheetAction[];
  cancelText?: string;
};

export type PickerChoice = { label: string; value: string };

export type PickerOptions = {
  title: string;
  subtitle?: string;
  options: (string | PickerChoice)[];
  selected?: string | null;
  searchable?: boolean;
  searchPlaceholder?: string;
  cancelText?: string;
  onSelect: (value: string) => void;
};

type AlertApi = {
  showAlert: (options: AlertOptions) => void;
  showMatch: (options: MatchAlertOptions) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  showToast: (options: ToastOptions) => void;
  showActionSheet: (options: ActionSheetOptions) => void;
  showPicker: (options: PickerOptions) => void;
};

const AlertContext = createContext<AlertApi | null>(null);

const TYPE_CONFIG: Record<AlertType, { icon: React.ComponentProps<typeof Ionicons>['name']; color: string; tint: string }> = {
  success: { icon: 'checkmark-circle', color: palette.success, tint: 'rgba(23, 114, 69, 0.12)' },
  error: { icon: 'alert-circle', color: palette.danger, tint: 'rgba(187, 47, 47, 0.12)' },
  warning: { icon: 'warning', color: palette.warning, tint: 'rgba(178, 108, 24, 0.12)' },
  info: { icon: 'information-circle', color: palette.primary, tint: 'rgba(36, 134, 224, 0.12)' },
  confirm: { icon: 'help-circle', color: palette.primary, tint: 'rgba(36, 134, 224, 0.12)' },
};

const MATCH_TINT = 'rgba(36, 134, 224, 0.12)';

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
  const [actionSheet, setActionSheet] = useState<(ActionSheetOptions & { id: number }) | null>(null);
  const [picker, setPicker] = useState<(PickerOptions & { id: number }) | null>(null);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const counter = useRef(0);
  const insets = useContext(SafeAreaInsetsContext);
  const bottomInset = insets?.bottom ?? 0;

  const closeDialog = useCallback(() => setDialog(null), []);
  const closeMatchDialog = useCallback(() => setMatchDialog(null), []);
  const closeActionSheet = useCallback(() => setActionSheet(null), []);
  const closePicker = useCallback(() => setPicker(null), []);

  const showActionSheet = useCallback((options: ActionSheetOptions) => {
    counter.current += 1;
    setActionSheet({ ...options, id: counter.current });
  }, []);

  const showPicker = useCallback((options: PickerOptions) => {
    counter.current += 1;
    setPicker({ ...options, id: counter.current });
  }, []);

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

  const api = useMemo<AlertApi>(
    () => ({ showAlert, showMatch, confirm, showToast, showActionSheet, showPicker }),
    [showAlert, showMatch, confirm, showToast, showActionSheet, showPicker],
  );

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
              <View style={styles.backdropTint} />
            </Pressable>

            <Animated.View entering={cardEntering} exiting={CARD_EXIT} style={styles.cardContainer}>
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={[styles.iconChip, { backgroundColor: config.tint }]}>
                    <Ionicons name={config.icon} size={28} color={config.color} />
                  </View>
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
            </Animated.View>
          </View>
        ) : null}
      </Modal>

      <Modal transparent visible={matchDialog !== null} animationType="fade" statusBarTranslucent onRequestClose={closeMatchDialog}>
        {matchDialog ? (
          <View style={styles.modalRoot}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeMatchDialog}>
              <View style={styles.backdropTint} />
            </Pressable>

            <Animated.View entering={cardEntering} exiting={CARD_EXIT} style={styles.cardContainer}>
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={[styles.iconChip, { backgroundColor: MATCH_TINT }]}>
                    <Ionicons name="heart" size={28} color={palette.primary} />
                  </View>
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
            </Animated.View>
          </View>
        ) : null}
      </Modal>

      <Modal
        transparent
        visible={actionSheet !== null}
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={closeActionSheet}>
        {actionSheet ? (
          <ActionSheetView
            data={actionSheet}
            bottomInset={bottomInset}
            onClose={closeActionSheet}
            onRun={(action) => {
              closeActionSheet();
              action.onPress?.();
            }}
          />
        ) : null}
      </Modal>

      <Modal
        transparent
        visible={picker !== null}
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={closePicker}>
        {picker ? (
          <PickerSheetView
            data={picker}
            bottomInset={bottomInset}
            onClose={closePicker}
            onPick={(value) => {
              closePicker();
              picker.onSelect(value);
            }}
          />
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

function ActionSheetView({
  data,
  bottomInset,
  onClose,
  onRun,
}: {
  data: ActionSheetOptions;
  bottomInset: number;
  onClose: () => void;
  onRun: (action: ActionSheetAction) => void;
}) {
  return (
    <View style={styles.sheetRoot}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <View style={styles.sheetBackdrop} />
      </Pressable>

      <Animated.View
        entering={SlideInDown.duration(240)}
        exiting={SlideOutDown.duration(160)}
        style={[styles.sheetCard, { paddingBottom: bottomInset + spacing.sm }]}>
        <View style={styles.sheetHandle} />
        {data.title ? <Text style={styles.sheetTitle}>{data.title}</Text> : null}
        {data.message ? <Text style={styles.sheetMessage}>{data.message}</Text> : null}

        <View style={styles.sheetList}>
          {data.actions.map((action, index) => {
            const destructive = action.style === 'destructive';
            return (
              <Pressable
                key={`${action.label}-${index}`}
                onPress={() => onRun(action)}
                style={({ pressed }) => [styles.sheetRow, pressed && styles.sheetRowPressed]}>
                {action.icon ? (
                  <Ionicons name={action.icon} size={20} color={destructive ? palette.danger : palette.primary} style={styles.sheetRowIcon} />
                ) : null}
                <Text style={[styles.sheetRowLabel, destructive && styles.sheetRowDanger]}>{action.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable onPress={onClose} style={({ pressed }) => [styles.sheetCancel, pressed && styles.sheetCancelPressed]}>
          <Text style={styles.sheetCancelText}>{data.cancelText ?? 'Cancel'}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

function PickerSheetView({
  data,
  bottomInset,
  onClose,
  onPick,
}: {
  data: PickerOptions;
  bottomInset: number;
  onClose: () => void;
  onPick: (value: string) => void;
}) {
  const [query, setQuery] = useState('');
  const choices: PickerChoice[] = data.options.map((option) =>
    typeof option === 'string' ? { label: option, value: option } : option,
  );
  const q = query.trim().toLowerCase();
  const filtered = q ? choices.filter((choice) => choice.label.toLowerCase().includes(q)) : choices;

  return (
    <View style={styles.sheetRoot}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <View style={styles.sheetBackdrop} />
      </Pressable>

      <Animated.View
        entering={SlideInDown.duration(240)}
        exiting={SlideOutDown.duration(160)}
        style={[styles.sheetCard, styles.pickerCard, { paddingBottom: bottomInset + spacing.sm }]}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>{data.title}</Text>
        {data.subtitle ? <Text style={styles.sheetMessage}>{data.subtitle}</Text> : null}

        {data.searchable ? (
          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color={palette.textSecondary} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder={data.searchPlaceholder ?? 'Search'}
              placeholderTextColor={palette.textSecondary}
              autoCorrect={false}
            />
          </View>
        ) : null}

        <ScrollView
          style={styles.pickerScroll}
          contentContainerStyle={styles.pickerScrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}>
          {filtered.map((choice) => {
            const active = data.selected === choice.value;
            return (
              <Pressable
                key={choice.value}
                onPress={() => onPick(choice.value)}
                style={({ pressed }) => [styles.pickerRow, pressed && styles.sheetRowPressed]}>
                <Text style={[styles.pickerLabel, active && styles.pickerLabelActive]}>{choice.label}</Text>
                {active ? <Ionicons name="checkmark" size={20} color={palette.primary} /> : null}
              </Pressable>
            );
          })}
          {filtered.length === 0 ? <Text style={styles.pickerEmpty}>No matches</Text> : null}
        </ScrollView>

        <Pressable onPress={onClose} style={({ pressed }) => [styles.sheetCancel, pressed && styles.sheetCancelPressed]}>
          <Text style={styles.sheetCancelText}>{data.cancelText ?? 'Cancel'}</Text>
        </Pressable>
      </Animated.View>
    </View>
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
    backgroundColor: 'rgba(11, 26, 48, 0.45)',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    shadowColor: '#0a1422',
    shadowOpacity: 0.22,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
  },
  cardContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  iconChip: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
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
    fontSize: typography.body,
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
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 26, 48, 0.40)',
  },
  sheetCard: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  pickerCard: {
    maxHeight: '78%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: palette.border,
    marginBottom: spacing.sm,
  },
  sheetTitle: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: palette.textPrimary,
    textAlign: 'center',
  },
  sheetMessage: {
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xxs,
  },
  sheetList: {
    marginTop: spacing.md,
    gap: spacing.xxs,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  sheetRowPressed: {
    backgroundColor: palette.chipSurfaceSoft,
  },
  sheetRowIcon: {
    width: 22,
    textAlign: 'center',
  },
  sheetRowLabel: {
    flex: 1,
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  sheetRowDanger: {
    color: palette.danger,
  },
  sheetCancel: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.chipSurfaceSoft,
    marginTop: spacing.sm,
  },
  sheetCancelPressed: {
    backgroundColor: palette.border,
  },
  sheetCancelText: {
    fontSize: typography.button,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textPrimary,
    paddingVertical: spacing.sm,
  },
  pickerScroll: {
    marginTop: spacing.sm,
  },
  pickerScrollContent: {
    paddingBottom: spacing.xs,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 50,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  pickerLabel: {
    flex: 1,
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  pickerLabelActive: {
    color: palette.primary,
    fontWeight: '800',
  },
  pickerEmpty: {
    textAlign: 'center',
    color: palette.textSecondary,
    paddingVertical: spacing.lg,
  },
});
