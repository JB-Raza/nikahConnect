import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFonts } from '@expo-google-fonts/plus-jakarta-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useState } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AnimatedSplash from '@/components/animated-splash';
import AlertProvider from '@/features/alerts/alert-provider';
import ChatProvider from '@/features/chat/chat-context';
import FiltersProvider from '@/features/filters/filters-context';
import EditProfileDraftProvider from '@/features/profile/edit-profile-draft-context';
import ProfileActionsProvider from '@/features/profile/profile-actions-context';
import UserProfileProvider from '@/features/profile/user-profile-context';
import PremiumProvider from '@/features/premium/premium-context';
import { applyGlobalFont, fontAssets } from '@/theme/fonts';

applyGlobalFont();
SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const [splashDone, setSplashDone] = useState(false);

  // Hand off from the native splash to the custom overlay only once the overlay is
  // laid out, so the two never leave a blank frame between them.
  const handleSplashLayout = useCallback(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <KeyboardProvider>
        <SafeAreaProvider>
          <BottomSheetModalProvider>
            <AlertProvider>
              <FiltersProvider>
                <UserProfileProvider>
                  <EditProfileDraftProvider>
                    <ProfileActionsProvider>
                      <PremiumProvider>
                        <ChatProvider>
                          <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen
                              name="filters"
                              options={{
                                presentation: 'card',
                                animation: 'fade_from_bottom',
                                animationDuration: 200,
                              }}
                            />
                            <Stack.Screen
                              name="filter-option"
                              options={{
                                presentation: 'card',
                                animation: 'fade_from_bottom',
                                animationDuration: 200,
                              }}
                            />
                            <Stack.Screen name="premium/checkout" options={{ presentation: 'card', animation: 'slide_from_bottom' }} />
                            <Stack.Screen name="edit-profile-field" options={{ presentation: 'card', animation: 'slide_from_right' }} />
                            <Stack.Screen name="report" options={{ presentation: 'card', animation: 'slide_from_bottom' }} />
                            <Stack.Screen name="boost" options={{ presentation: 'transparentModal', animation: 'fade' }} />
                            <Stack.Screen name="call" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
                            <Stack.Screen name="match/[id]" options={{ presentation: 'transparentModal', animation: 'fade' }} />
                          </Stack>
                        </ChatProvider>
                      </PremiumProvider>
                    </ProfileActionsProvider>
                  </EditProfileDraftProvider>
                </UserProfileProvider>
              </FiltersProvider>
            </AlertProvider>
          </BottomSheetModalProvider>
        </SafeAreaProvider>
      </KeyboardProvider>

      {!splashDone ? (
        <AnimatedSplash onFinish={() => setSplashDone(true)} onLayout={handleSplashLayout} />
      ) : null}
    </GestureHandlerRootView>
  );
}
