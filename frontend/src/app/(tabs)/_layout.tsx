import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View, type ColorValue } from 'react-native';

import { colors, spacing, typography } from '@/theme/theme';

export default function TabsLayout() {
  const palette = colors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: false,
        tabBarActiveTintColor: palette.tabBarActive,
        tabBarInactiveTintColor: palette.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: spacing.xs,
          marginTop: spacing.xxs,
        },
        tabBarStyle: {
          backgroundColor: palette.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: palette.tabBarBorder,
          height: 78,
          paddingTop: spacing.sm,
          paddingBottom: spacing.sm,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          ...styles.shadow,
        },
        tabBarItemStyle: {
          paddingVertical: spacing.xxs,
        },
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

type TabIconProps = {
  focused: boolean;
  color: ColorValue;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

function TabIcon({ focused, color, icon }: TabIconProps) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(23, 114, 69, 0.12)',
  },
  shadow: {
    shadowColor: '#0c1712',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -2 },
    elevation: Platform.OS === 'android' ? 12 : 0,
  },
});
