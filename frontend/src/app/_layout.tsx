import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AlertProvider from '@/features/alerts/alert-provider';
import FiltersProvider from '@/features/filters/filters-context';
import PremiumProvider from '@/features/premium/premium-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AlertProvider>
        <FiltersProvider>
          <PremiumProvider>
            <BottomSheetModalProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen
                  name="filters"
                  options={{
                    presentation: 'card',
                    animation: 'slide_from_bottom',
                    animationDuration: 50,
                  }}
                />
                <Stack.Screen
                  name="filter-option"
                  options={{
                    presentation: 'card',
                    animation: 'slide_from_right',
                    animationDuration: 1000,
                  }}
                />
                <Stack.Screen name="premium/checkout" options={{ presentation: 'card', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="report" options={{ presentation: 'card', animation: 'slide_from_bottom' }} />
                <Stack.Screen name="boost" options={{ presentation: 'transparentModal', animation: 'fade' }} />
                <Stack.Screen name="match/[id]" options={{ presentation: 'transparentModal', animation: 'fade' }} />
              </Stack>
            </BottomSheetModalProvider>
          </PremiumProvider>
        </FiltersProvider>
      </AlertProvider>
    </GestureHandlerRootView>
  );
}
