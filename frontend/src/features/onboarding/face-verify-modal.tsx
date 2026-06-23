import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GradientButton from '@/components/gradient-button';
import { useAlert } from '@/features/alerts/alert-provider';
import { capturePhoto } from '@/features/media/camera';
import { verifyFaces } from '@/features/verification/face-match';
import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

const palette = colors.light;

type Phase = 'intro' | 'checking' | 'pass' | 'fail';

type FaceVerifyModalProps = {
  visible: boolean;
  photos: string[];
  onRemovePhoto: (uri: string) => void;
  onVerified: () => void;
  onClose: () => void;
};

export default function FaceVerifyModal({ visible, photos, onRemovePhoto, onVerified, onClose }: FaceVerifyModalProps) {
  const insets = useSafeAreaInsets();
  const { showAlert, showToast } = useAlert();

  const [phase, setPhase] = useState<Phase>('intro');
  const [unmatched, setUnmatched] = useState<string[]>([]);

  // Reset to the intro state every time the modal is shown (handled in the
  // Modal's onShow event, so we don't call setState inside an effect).
  const resetToIntro = () => {
    setPhase('intro');
    setUnmatched([]);
  };

  // Auto-advance shortly after a successful match.
  useEffect(() => {
    if (phase !== 'pass') {
      return;
    }
    const timer = setTimeout(onVerified, 1200);
    return () => clearTimeout(timer);
  }, [phase, onVerified]);

  const runCheck = async (selfieUri: string) => {
    setPhase('checking');
    const result = await verifyFaces(selfieUri, photos);
    if (result.matched) {
      setPhase('pass');
    } else {
      setUnmatched(result.unmatchedPhotoUris);
      setPhase('fail');
    }
  };

  const captureSelfie = async () => {
    const result = await capturePhoto({ cameraType: ImagePicker.CameraType.front, quality: 0.7 });
    switch (result.status) {
      case 'success':
        runCheck(result.uri);
        return;
      case 'unsupported':
        showAlert({
          type: 'info',
          title: 'Camera unavailable',
          message: 'The simulator has no camera. Use “Simulate check” to test the flow, or run on a real device.',
        });
        return;
      case 'denied':
        showAlert({
          type: 'warning',
          title: 'Camera access needed',
          message: 'Enable camera access for NikahConnect in Settings to verify your face.',
        });
        return;
      case 'error':
        showToast({ type: 'error', message: 'Could not open the camera.' });
        return;
    }
  };

  // Unmatched photos that are still in the user's set.
  const remainingUnmatched = unmatched.filter((uri) => photos.includes(uri));
  const canContinue = remainingUnmatched.length === 0 && photos.length >= 1;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onShow={resetToIntro} onRequestClose={onClose}>
      <View style={[styles.screen, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.topBar}>
          <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close">
            <Ionicons name="close" size={26} color={palette.textPrimary} />
          </Pressable>
          <Text style={styles.topTitle}>Face verification</Text>
          <View style={styles.topSpacer} />
        </View>

        {phase === 'intro' ? (
          <View style={styles.body}>
            <View style={styles.iconBubble}>
              <Ionicons name="scan-outline" size={48} color={palette.primary} />
            </View>
            <Text style={styles.title}>Verify it&apos;s really you</Text>
            <Text style={styles.subtitle}>
              Take a quick selfie with your front camera. We&apos;ll check it against your profile photos to keep
              NikahConnect safe and authentic. Your selfie is never shown on your profile.
            </Text>

            <View style={styles.actions}>
              <GradientButton label="Open front camera" icon="camera" onPress={captureSelfie} />
              <Pressable style={styles.secondaryButton} onPress={() => runCheck('simulated://selfie')}>
                <Text style={styles.secondaryButtonText}>Simulate check (no camera)</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {phase === 'checking' ? (
          <View style={styles.body}>
            <ActivityIndicator size="large" color={palette.primary} />
            <Text style={styles.title}>Matching your face…</Text>
            <Text style={styles.subtitle}>Hold tight, this only takes a moment.</Text>
          </View>
        ) : null}

        {phase === 'pass' ? (
          <View style={styles.body}>
            <View style={[styles.iconBubble, styles.iconBubbleSuccess]}>
              <Ionicons name="checkmark" size={52} color={palette.success} />
            </View>
            <Text style={styles.title}>You&apos;re verified</Text>
            <Text style={styles.subtitle}>Your face matched your photos. Finishing up your profile…</Text>
            <View style={styles.actions}>
              <GradientButton label="Continue" onPress={onVerified} />
            </View>
          </View>
        ) : null}

        {phase === 'fail' ? (
          <View style={styles.failBody}>
            <View style={[styles.iconBubble, styles.iconBubbleWarning]}>
              <Ionicons name="alert" size={48} color={palette.warning} />
            </View>
            <Text style={styles.title}>Some photos don&apos;t match</Text>
            <Text style={styles.subtitle}>
              These photos didn&apos;t match your selfie. Remove them and add photos that clearly show your face
              (at least one is required).
            </Text>

            <View style={styles.thumbRow}>
              {remainingUnmatched.map((uri) => (
                <View key={uri} style={styles.thumbWrap}>
                  <Image source={{ uri }} style={styles.thumb} contentFit="cover" />
                  <Pressable style={styles.thumbRemove} onPress={() => onRemovePhoto(uri)} accessibilityLabel="Remove photo">
                    <Ionicons name="trash" size={16} color="#ffffff" />
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={styles.actions}>
              {canContinue ? (
                <GradientButton label="Continue" onPress={onVerified} />
              ) : (
                <Pressable style={styles.secondaryButton} onPress={() => setPhase('intro')}>
                  <Text style={styles.secondaryButtonText}>Try again</Text>
                </Pressable>
              )}
              {photos.length === 0 ? (
                <Pressable style={styles.secondaryButton} onPress={onClose}>
                  <Text style={styles.secondaryButtonText}>Back to photos</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background, paddingHorizontal: spacing.xl },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topTitle: { fontSize: typography.subtitle, fontWeight: '800', color: palette.textPrimary },
  topSpacer: { width: 26 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  failBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  iconBubble: {
    width: 104,
    height: 104,
    borderRadius: radius.pill,
    backgroundColor: palette.chipSurfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconBubbleSuccess: { backgroundColor: 'rgba(23,114,69,0.12)' },
  iconBubbleWarning: { backgroundColor: 'rgba(178,108,24,0.14)' },
  title: { fontSize: typography.titleMd, fontWeight: '800', color: palette.textPrimary, textAlign: 'center' },
  subtitle: {
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  thumbRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, marginVertical: spacing.sm },
  thumbWrap: { width: 92, height: 92, borderRadius: radius.md, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%', backgroundColor: palette.chipSurfaceSoft },
  thumbRemove: {
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: palette.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.md },
  secondaryButton: {
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { fontSize: typography.button, fontWeight: '700', color: palette.textPrimary },
});
