import * as Device from 'expo-device';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export type CameraCaptureResult =
  | { status: 'unsupported' }
  | { status: 'denied' }
  | { status: 'cancelled' }
  | { status: 'error' }
  | { status: 'success'; uri: string };

// The iOS Simulator has no camera and crashes natively when one is launched.
// Android emulators DO expose working (emulated/virtual-scene) cameras, so we
// only treat the iOS Simulator as unsupported.
export const isCameraAvailable = (): boolean => {
  if (Platform.OS === 'ios') {
    return Device.isDevice;
  }
  return true;
};

export async function capturePhoto(
  options: ImagePicker.ImagePickerOptions = {},
): Promise<CameraCaptureResult> {
  if (!isCameraAvailable()) {
    return { status: 'unsupported' };
  }

  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return { status: 'denied' };
    }

    const result = await ImagePicker.launchCameraAsync(options);
    if (result.canceled || !result.assets?.length) {
      return { status: 'cancelled' };
    }

    return { status: 'success', uri: result.assets[0].uri };
  } catch {
    return { status: 'error' };
  }
}
