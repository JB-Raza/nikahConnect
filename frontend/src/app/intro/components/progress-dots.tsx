import { StyleSheet, View } from 'react-native';

import { radius, spacing } from '@/theme/theme';

type ProgressDotsProps = {
  total: number;
  activeIndex: number;
};

export default function ProgressDots({ total, activeIndex }: ProgressDotsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === activeIndex;
        return (
          <View
            key={`dot-${index}`}
            style={[
              styles.dot,
              {
                width: isActive ? spacing.lg : spacing.xs,
                backgroundColor: isActive ? '#ffffff' : 'rgba(255,255,255,0.4)',
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  dot: {
    height: spacing.xs,
    borderRadius: radius.pill,
  },
});
