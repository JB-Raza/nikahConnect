import { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, StyleSheet, View } from 'react-native';

import { colors, radius } from '@/theme/theme';

const THUMB = 26;
const TRACK_HEIGHT = 5;
const palette = colors.light;

type RangeSliderProps = {
  min: number;
  max: number;
  step?: number;
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
};

export function RangeSlider({ min, max, step = 1, low, high, onChange }: RangeSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const usable = Math.max(trackWidth - THUMB, 1);

  const [lowValue, setLowValue] = useState(low);
  const [highValue, setHighValue] = useState(high);

  const usableRef = useRef(usable);
  const lowRef = useRef(low);
  const highRef = useRef(high);
  const onChangeRef = useRef(onChange);
  const startXRef = useRef(0);
  const startHighXRef = useRef(0);

  useEffect(() => {
    usableRef.current = usable;
  }, [usable]);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  useEffect(() => {
    lowRef.current = lowValue;
  }, [lowValue]);
  useEffect(() => {
    highRef.current = highValue;
  }, [highValue]);

  const valueToX = (value: number, u = usableRef.current) => ((value - min) / (max - min)) * u;
  const xToValue = (x: number, u = usableRef.current) => {
    const raw = min + (x / u) * (max - min);
    const stepped = Math.round(raw / step) * step;
    return Math.min(Math.max(stepped, min), max);
  };

  const lowPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startXRef.current = valueToX(lowRef.current);
      },
      onPanResponderMove: (_event, gesture) => {
        const u = usableRef.current;
        let nextX = startXRef.current + gesture.dx;
        const maxX = valueToX(highRef.current, u);
        if (nextX < 0) nextX = 0;
        if (nextX > maxX) nextX = maxX;
        const value = xToValue(nextX, u);
        lowRef.current = value;
        setLowValue(value);
        onChangeRef.current(value, highRef.current);
      },
    }),
  ).current;

  const highPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startHighXRef.current = valueToX(highRef.current);
      },
      onPanResponderMove: (_event, gesture) => {
        const u = usableRef.current;
        let nextX = startHighXRef.current + gesture.dx;
        const minX = valueToX(lowRef.current, u);
        if (nextX > u) nextX = u;
        if (nextX < minX) nextX = minX;
        const value = xToValue(nextX, u);
        highRef.current = value;
        setHighValue(value);
        onChangeRef.current(lowRef.current, value);
      },
    }),
  ).current;

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const lowX = valueToX(lowValue);
  const highX = valueToX(highValue);

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <View style={[styles.track, { backgroundColor: palette.border }]} />
      <View style={[styles.fill, { left: THUMB / 2 + lowX, width: Math.max(highX - lowX, 0), backgroundColor: palette.primary }]} />
      <View
        {...lowPan.panHandlers}
        style={[styles.thumb, { left: lowX, borderColor: palette.primary, backgroundColor: palette.surface }]}
      />
      <View
        {...highPan.panHandlers}
        style={[styles.thumb, { left: highX, borderColor: palette.primary, backgroundColor: palette.surface }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: THUMB,
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    left: THUMB / 2,
    right: THUMB / 2,
    height: TRACK_HEIGHT,
    borderRadius: radius.pill,
  },
  fill: {
    position: 'absolute',
    height: TRACK_HEIGHT,
    borderRadius: radius.pill,
  },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 3,
    shadowColor: '#0c1712',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
