import {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
  type BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

import { type OnboardingForm, type Step } from './config';
import StepBody from './step-body';

const palette = colors.light;

/** Multi-select kinds keep the sheet open and confirm via a Done button. */
const DONE_KINDS = ['checkbox', 'chips', 'chipGroups', 'chipCategories'];

/** Approx. footer height so scroll content clears the pinned Done button. */
const FOOTER_HEIGHT = sizing.buttonHeight + spacing.md * 2;

const noop = () => {};

type PickerSheetProps = {
  step: Step | null;
  form: OnboardingForm;
  age: number | null;
  patch: (partial: Partial<OnboardingForm>) => void;
  onSelectSingle: (field: keyof OnboardingForm, value: string) => void;
  onSetGroup: (field: keyof OnboardingForm, value: string) => void;
  onToggleMulti: (field: keyof OnboardingForm, value: string) => void;
  onDone: () => void;
};

const PickerSheet = forwardRef<BottomSheetModal, PickerSheetProps>(function PickerSheet(
  { step, form, age, patch, onSelectSingle, onSetGroup, onToggleMulti, onDone },
  ref,
) {
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['90%'], []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    [],
  );

  const showDone = step ? DONE_KINDS.includes(step.kind) : false;

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) =>
      showDone ? (
        <BottomSheetFooter {...props} bottomInset={0}>
          <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
            <Pressable style={({ pressed }) => [styles.doneButton, pressed && styles.donePressed]} onPress={onDone}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>
        </BottomSheetFooter>
      ) : null,
    [showDone, insets.bottom, onDone],
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: palette.border }}
      backgroundStyle={{ backgroundColor: palette.surface }}>
      <BottomSheetScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.xl + (showDone ? FOOTER_HEIGHT : 0) },
        ]}
        keyboardShouldPersistTaps="handled">
        {step ? (
          <>
            <Text style={styles.title}>{step.title}</Text>
            {step.subtitle ? <Text style={styles.subtitle}>{step.subtitle}</Text> : null}

            <View style={styles.body}>
              <StepBody
                step={step}
                form={form}
                age={age}
                patch={patch}
                onSelectSingle={onSelectSingle}
                onSetGroup={onSetGroup}
                onToggleMulti={onToggleMulti}
                onAddPhoto={noop}
                onRemovePhoto={noop}
              />
            </View>
          </>
        ) : null}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

export default PickerSheet;

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  title: { fontSize: typography.titleMd, lineHeight: 30, fontWeight: '800', color: palette.textPrimary },
  subtitle: { fontSize: typography.body, lineHeight: 22, fontWeight: '500', color: palette.textSecondary, marginTop: spacing.xs },
  body: { marginTop: spacing.lg },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: palette.surface,
  },
  doneButton: {
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donePressed: { backgroundColor: palette.primaryPressed },
  doneText: { fontSize: typography.button, fontWeight: '800', color: palette.textOnPrimary },
});
