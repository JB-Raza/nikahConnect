import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme/theme';

const palette = colors.light;

type VerifiedStarProps = {
  size?: number;
};

export default function VerifiedStar({ size = 14 }: VerifiedStarProps) {
  return (
    <View style={[styles.verifiedStar, { width: size, height: size }]}>
      <Ionicons name="star" size={size} color={palette.primary} style={StyleSheet.absoluteFill} />
      <Ionicons name="checkmark" size={size * 0.6} color="#ffffff" />
    </View>
  );
}

const styles = StyleSheet.create({
  verifiedStar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
