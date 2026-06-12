import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { getNavTheme, useColorScheme } from "@/theme";

function RootStack() {
  const { colorScheme } = useColorScheme();
  const nav = getNavTheme(colorScheme);

  return (
    <>
      <StatusBar style={nav.statusBar} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: nav.headerBg },
          headerTintColor: nav.headerTint,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: nav.contentBg },
        }}
      />
    </>
  );
}

export default function Layout() {
  return <RootStack />;
}
