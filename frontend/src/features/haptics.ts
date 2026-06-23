import * as Haptics from 'expo-haptics';

/**
 * Thin wrapper around `expo-haptics` so call sites stay terse and any platform
 * that lacks a Taptic engine simply no-ops instead of throwing.
 */

/** Light tap — for routine selections (filter chips, tab switches, sends). */
export function hapticSelection() {
  Haptics.selectionAsync().catch(() => undefined);
}

/** Medium bump — for a confirmed action with weight (like, boost, apply). */
export function hapticImpact(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) {
  Haptics.impactAsync(style).catch(() => undefined);
}

/** Success buzz — for celebratory moments (a new match, payment success). */
export function hapticSuccess() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}
