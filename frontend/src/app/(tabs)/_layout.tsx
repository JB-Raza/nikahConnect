import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ColorValue,
  type GestureResponderEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme/theme';

const TAB_BAR_CONTENT_HEIGHT = 64;

export default function TabsLayout() {
  const palette = colors.light;
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, spacing.sm);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: false,
        tabBarActiveTintColor: palette.tabBarActive,
        tabBarInactiveTintColor: palette.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: spacing.xxs,
        },
        tabBarStyle: {
          backgroundColor: palette.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: palette.tabBarBorder,
          height: TAB_BAR_CONTENT_HEIGHT + bottomInset,
          paddingTop: spacing.sm,
          paddingBottom: bottomInset,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          ...styles.shadow,
        },
        tabBarItemStyle: {
          paddingVertical: spacing.xxs,
        },
        tabBarButton: (props) => <TabBarButton {...props} />,
      }}>
      <Tabs.Screen
        name="marriage"
        options={{
          title: 'Marriage',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} icon={focused ? 'heart' : 'heart-outline'} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} icon={focused ? 'compass' : 'compass-outline'} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} icon={focused ? 'chatbubble' : 'chatbubble-outline'} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} icon={focused ? 'person-circle' : 'person-circle-outline'} />
          ),
        }}
      />
    </Tabs>
  );
}

type TabBarButtonProps = {
  children?: React.ReactNode;
  style?: unknown;
  onPressIn?: ((event: GestureResponderEvent) => void) | null;
  onPressOut?: ((event: GestureResponderEvent) => void) | null;
};

function TabBarButton({ children, style, onPressIn, onPressOut, ...rest }: TabBarButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (event: GestureResponderEvent) => {
    Animated.spring(scale, { toValue: 0.82, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
    onPressOut?.(event);
  };

  return (
    <Pressable
      {...rest}
      android_ripple={null}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.tabButton, style as object]}>
      <Animated.View style={[styles.tabButtonInner, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

type TabIconProps = {
  focused: boolean;
  color: ColorValue;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

function TabIcon({ focused, color, icon }: TabIconProps) {
  if (focused) {
    return (
      <LinearGradient
        colors={['rgba(36, 134, 224, 0.22)', 'rgba(36, 134, 224, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.iconWrap, styles.iconWrapActive]}>
        <Ionicons name={icon} size={20} color={color} />
      </LinearGradient>
    );
  }
  return (
    <View style={styles.iconWrap}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
  },
  tabButtonInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconWrapActive: {
    borderWidth: 1,
    borderColor: 'rgba(36, 134, 224, 0.18)',
  },
  shadow: {
    shadowColor: '#0c1712',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -2 },
    elevation: Platform.OS === 'android' ? 12 : 0,
  },
});
