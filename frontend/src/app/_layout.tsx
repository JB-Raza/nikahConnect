import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AlertProvider from '@/features/alerts/alert-provider';
import ChatProvider from '@/features/chat/chat-context';
import FiltersProvider from '@/features/filters/filters-context';
import EditProfileDraftProvider from '@/features/profile/edit-profile-draft-context';
import ProfileActionsProvider from '@/features/profile/profile-actions-context';
import UserProfileProvider from '@/features/profile/user-profile-context';
import PremiumProvider from '@/features/premium/premium-context';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  );
}
