import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { MAX_PHOTOS } from '@/features/onboarding/config';
import { colors, radius, spacing, typography } from '@/theme/theme';

const palette = colors.light;
const COLUMNS = 3;
const HORIZONTAL_PADDING = spacing.xl * 2;

type ProfilePhotoGridProps = {
  photos: string[];
  onAddPhoto: () => void;
  onRemovePhoto: (uri: string) => void;
  contentPadding?: number;
};

export default function ProfilePhotoGrid({
  photos,
  onAddPhoto,
  onRemovePhoto,
  contentPadding = HORIZONTAL_PADDING,
}: ProfilePhotoGridProps) {
  const { width } = useWindowDimensions();
  const gap = spacing.sm;
  const tileSize = Math.floor((width - contentPadding - gap * (COLUMNS - 1)) / COLUMNS);

  return (
    <View style={[styles.grid, { gap }]}>
      {Array.from({ length: MAX_PHOTOS }).map((_, index) => {
        const uri = photos[index];
        const tileStyle = { width: tileSize, height: Math.round(tileSize * 1.28) };

        if (uri) {
          return (
            <Pressable key={uri} style={[styles.tile, tileStyle]} onPress={() => onRemovePhoto(uri)}>
              <Image source={{ uri }} style={styles.image} contentFit="cover" transition={120} />
              {index === 0 ? (
                <View style={styles.mainBadge}>
                  <Text style={styles.mainBadgeText}>Main</Text>
                </View>
              ) : null}
              <View style={styles.removeBadge}>
                <Ionicons name="close" size={14} color="#ffffff" />
              </View>
            </Pressable>
          );
        }

        const isNext = index === photos.length;
        return (
          <Pressable
            key={`empty-${index}`}
            style={[styles.tile, styles.empty, tileStyle, isNext && styles.emptyActive]}
            onPress={onAddPhoto}
            disabled={!isNext}>
            <Ionicons name={isNext ? 'add' : 'image-outline'} size={26} color={isNext ? palette.primary : palette.textSecondary} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  tile: { borderRadius: radius.md, overflow: 'hidden', backgroundColor: palette.chipSurfaceSoft },
  image: { width: '100%', height: '100%' },
  empty: {
    borderWidth: 1.5,
    borderColor: palette.border,
    borderStyle: 'dashed',
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyActive: { borderColor: palette.primary, backgroundColor: palette.chipSurfaceSoft },
  mainBadge: {
    position: 'absolute',
    left: spacing.xs,
    top: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: palette.primary,
  },
  mainBadgeText: { fontSize: typography.label, fontWeight: '800', color: '#ffffff' },
  removeBadge: {
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(8,16,24,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
