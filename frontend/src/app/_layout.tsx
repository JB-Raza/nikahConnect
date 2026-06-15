import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { FiltersProvider } from '@/features/filters/filters-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FiltersProvider>
        <BottomSheetModalProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="filters" options={{ presentation: 'card', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="filter-option" options={{ presentation: 'card', animation: 'slide_from_right' }} />
          </Stack>
        </BottomSheetModalProvider>
      </FiltersProvider>
    </GestureHandlerRootView>
  );
}
