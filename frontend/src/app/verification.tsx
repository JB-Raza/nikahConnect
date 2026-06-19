import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAlert } from '@/features/alerts/alert-provider';
import { capturePhoto } from '@/features/media/camera';
import { colors, radius, sizing, spacing, typography } from '@/theme/theme';

const palette = colors.light;

const STEPS = [
  { icon: 'camera-outline', title: 'Take a quick selfie', body: 'Follow the on-screen pose so we can match it to your profile photos.' },
  { icon: 'eye-off-outline', title: 'Private & secure', body: 'Your selfie is only used to confirm it’s really you. It’s never shown on your profile.' },
  { icon: 'shield-checkmark-outline', title: 'Get your blue badge', body: 'Verified profiles get more trust and better matches, inshaAllah.' },
] as const;

export default function VerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert, showToast } = useAlert();

  const [selfieUri, setSelfieUri] = useState<string | null>(null);

  const dismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/menu');
    }
  };

  const takeSelfie = async () => {
    const result = await capturePhoto({ cameraType: ImagePicker.CameraType.front, quality: 0.7 });
    switch (result.status) {
      case 'unsupported':
        showAlert({
          type: 'info',
          title: 'Camera unavailable',
          message: 'The simulator has no camera. Use a real device to verify your profile.',
        });
        return;
      case 'denied':
        showAlert({
          type: 'warning',
          title: 'Camera access needed',
          message: 'Enable camera access for NikahConnect in Settings to verify your profile.',
        });
        return;
      case 'error':
        showToast({ type: 'error', message: 'Could not open the camera.' });
        return;
      case 'success':
        setSelfieUri(result.uri);
        return;
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.xs }]}>
      <View style={styles.header}>
        <Pressable onPress={dismiss} hitSlop={10} style={styles.backButton} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={26} color={palette.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Verification</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {selfieUri ? (
          <View style={styles.pendingWrap}>
            <View style={styles.selfieFrame}>
              <Image source={{ uri: selfieUri }} style={styles.selfie} resizeMode="cover" />
              <View style={styles.pendingBadge}>
                <Ionicons name="time-outline" size={14} color="#ffffff" />
                <Text style={styles.pendingBadgeText}>In review</Text>
              </View>
            </View>
            <Text style={styles.pendingTitle}>Selfie submitted</Text>
            <Text style={styles.pendingBody}>
              Thanks! Our team will review your selfie and add your verified badge once it’s confirmed. This usually
              takes a little while.
            </Text>
            <Pressable style={styles.ghostButton} onPress={takeSelfie}>
              <Ionicons name="camera-reverse-outline" size={18} color={palette.primary} />
              <Text style={styles.ghostButtonText}>Retake selfie</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={dismiss}>
              <Text style={styles.primaryButtonText}>Done</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.hero}>
              <View style={styles.heroIcon}>
                <Ionicons name="shield-checkmark" size={40} color={palette.primary} />
              </View>
              <Text style={styles.title}>Get verified</Text>
              <Text style={styles.subtitle}>
                Confirm it’s really you with a quick selfie. Verified members stand out and earn more trust.
              </Text>
            </View>

            <View style={styles.steps}>
              {STEPS.map((step) => (
                <View key={step.title} style={styles.stepRow}>
                  <View style={styles.stepIcon}>
                    <Ionicons name={step.icon} size={20} color={palette.primary} />
                  </View>
                  <View style={styles.stepText}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepBody}>{step.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {!selfieUri ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <Pressable style={styles.primaryButton} onPress={takeSelfie}>
            <Ionicons name="camera" size={18} color={palette.textOnPrimary} />
            <Text style={styles.primaryButtonText}>Take a selfie</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  backButton: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: typography.titleMd, fontWeight: '800', color: palette.textPrimary },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  hero: { alignItems: 'center', paddingTop: spacing.lg, paddingHorizontal: spacing.md },
  heroIcon: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: palette.chipSurfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: typography.title, fontWeight: '800', color: palette.textPrimary, textAlign: 'center' },
  subtitle: {
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  steps: { marginTop: spacing.xxl, gap: spacing.lg },
  stepRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.chipSurfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1, gap: 2 },
  stepTitle: { fontSize: typography.subtitle, fontWeight: '800', color: palette.textPrimary },
  stepBody: { fontSize: typography.body, fontWeight: '500', color: palette.textSecondary, lineHeight: 21 },
  pendingWrap: { alignItems: 'center', paddingTop: spacing.lg, gap: spacing.sm },
  selfieFrame: { width: 180, height: 180, borderRadius: radius.pill, overflow: 'hidden', marginBottom: spacing.sm },
  selfie: { width: '100%', height: '100%', backgroundColor: palette.chipSurfaceSoft },
  pendingBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: palette.warning,
  },
  pendingBadgeText: { fontSize: typography.label, fontWeight: '800', color: '#ffffff' },
  pendingTitle: { fontSize: typography.titleMd, fontWeight: '800', color: palette.textPrimary },
  pendingBody: {
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: palette.background,
  },
  primaryButton: {
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.primary,
    alignSelf: 'stretch',
    paddingHorizontal: spacing.xl,
  },
  primaryButtonText: { fontSize: typography.button, fontWeight: '800', color: palette.textOnPrimary },
  ghostButton: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  ghostButtonText: { fontSize: typography.button, fontWeight: '700', color: palette.primary },
});
