import React from 'react';
import { StyleSheet, Text, TextInput, type TextStyle } from 'react-native';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

/**
 * Plus Jakarta Sans family, mapped per weight. Static weighted files are the most
 * reliable cross-platform approach (Android does not synthesize weights for custom fonts).
 */
export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const fontAssets = {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
};

/** Resolve the matching Jakarta family for a given RN fontWeight value. */
export function familyForWeight(weight: TextStyle['fontWeight']): string {
  switch (String(weight ?? '400')) {
    case '500':
      return fonts.medium;
    case '600':
      return fonts.semibold;
    case '700':
    case 'bold':
      return fonts.bold;
    case '800':
    case '900':
      return fonts.extrabold;
    default:
      return fonts.regular;
  }
}

/**
 * Patch Text/TextInput so every text element across the app renders in Plus Jakarta
 * Sans, picking the weighted font file that matches its existing `fontWeight`.
 * This applies the typeface app-wide without editing every StyleSheet, and keeps the
 * existing weights intact for design consistency.
 *
 * Cheap by design: it only flattens the element's own style once per render.
 */
let patched = false;
export function applyGlobalFont(): void {
  if (patched) {
    return;
  }
  patched = true;

  for (const Component of [Text, TextInput] as const) {
    const target = Component as unknown as {
      render?: (...args: unknown[]) => React.ReactElement<{ style?: unknown }>;
    };
    const originalRender = target.render;
    if (typeof originalRender !== 'function') {
      continue;
    }
    target.render = function patchedRender(...args: unknown[]) {
      const element = originalRender.apply(this, args);
      const flattened = (StyleSheet.flatten(element.props.style as TextStyle) ?? {}) as TextStyle;
      const fontFamily = familyForWeight(flattened.fontWeight);
      return React.cloneElement(element, {
        style: [{ fontFamily }, element.props.style],
      } as Partial<{ style?: unknown }>);
    };
  }
}
