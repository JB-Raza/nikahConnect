import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getChatById } from '@/features/chat/data';
import { radius, spacing, typography } from '@/theme/theme';

type CallMode = 'voice' | 'video';

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function CallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, name, mode } = useLocalSearchParams<{ id?: string; name?: string; mode?: CallMode }>();

  const isVideo = mode === 'video';
  const chat = id ? getChatById(id) : undefined;
  const displayName = name ?? chat?.name ?? 'Unknown';

  const [connected, setConnected] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(isVideo);
  const [cameraOn, setCameraOn] = useState(isVideo);

  const endCall = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/chat');
    }
  };

  // Simulate the call connecting after a short ring.
  useEffect(() => {
    const timer = setTimeout(() => setConnected(true), 2400);
    return () => clearTimeout(timer);
  }, []);

  // Tick the call duration once connected.
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!connected) {
      return;
    }
    intervalRef.current = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [connected]);

  const status = connected ? formatDuration(seconds) : isVideo ? 'Video calling…' : 'Calling…';

  return (
    <View style={styles.screen}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      {isVideo && cameraOn && chat ? (
        <Image source={chat.photo} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : null}
      <View style={[StyleSheet.absoluteFill, styles.scrim]} />

      <View style={[styles.body, { paddingTop: insets.top + spacing.xxl }]}>
        <View style={styles.identity}>
          {(!isVideo || !cameraOn) && chat ? (
            <Image source={chat.photo} style={styles.avatar} contentFit="cover" />
          ) : null}
          <Text style={styles.name}>{displayName}</Text>
          <View style={styles.statusRow}>
            {!connected ? <Ionicons name="cellular" size={14} color="rgba(255,255,255,0.8)" /> : null}
            <Text style={styles.status}>{status}</Text>
          </View>
        </View>

        {isVideo && cameraOn ? (
          <View style={styles.selfPreview}>
            <Ionicons name="person" size={28} color="rgba(255,255,255,0.7)" />
          </View>
        ) : null}
      </View>

      <View style={[styles.controls, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.controlRow}>
          <CallToggle
            icon={muted ? 'mic-off' : 'mic'}
            label="Mute"
            active={muted}
            onPress={() => setMuted((value) => !value)}
          />
          {isVideo ? (
            <CallToggle
              icon={cameraOn ? 'videocam' : 'videocam-off'}
              label="Camera"
              active={!cameraOn}
              onPress={() => setCameraOn((value) => !value)}
            />
          ) : null}
          <CallToggle
            icon={speaker ? 'volume-high' : 'volume-medium'}
            label="Speaker"
            active={speaker}
            onPress={() => setSpeaker((value) => !value)}
          />
        </View>

        <Pressable style={styles.endButton} onPress={endCall} accessibilityLabel="End call">
          <Ionicons name="call" size={30} color="#ffffff" style={styles.endIcon} />
        </Pressable>
      </View>
    </View>
  );
}

function CallToggle({
  icon,
  label,
  active,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.toggle} onPress={onPress} accessibilityLabel={label}>
      <View style={[styles.toggleCircle, active && styles.toggleCircleActive]}>
        <Ionicons name={icon} size={24} color={active ? '#16202b' : '#ffffff'} />
      </View>
      <Text style={styles.toggleLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0e1722' },
  scrim: { backgroundColor: 'rgba(8,16,24,0.55)' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'space-between' },
  identity: { alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 132,
    height: 132,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: spacing.sm,
  },
  name: { fontSize: typography.title, fontWeight: '800', color: '#ffffff' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  status: { fontSize: typography.subtitle, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  selfPreview: {
    width: 96,
    height: 132,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginRight: spacing.lg,
  },
  controls: { alignItems: 'center', gap: spacing.xl, paddingTop: spacing.xl },
  controlRow: { flexDirection: 'row', gap: spacing.xl, alignItems: 'flex-start' },
  toggle: { alignItems: 'center', gap: spacing.xs, width: 72 },
  toggleCircle: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleCircleActive: { backgroundColor: '#ffffff' },
  toggleLabel: { fontSize: typography.caption, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  endButton: {
    width: 68,
    height: 68,
    borderRadius: radius.pill,
    backgroundColor: '#e0413f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endIcon: { transform: [{ rotate: '135deg' }] },
});
