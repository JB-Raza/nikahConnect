import * as Device from 'expo-device';
import * as ImagePicker from 'expo-image-picker';

export type CameraCaptureResult =
  | { status: 'unsupported' }
  | { status: 'denied' }
  | { status: 'cancelled' }
  | { status: 'error' }
  | { status: 'success'; uri: string };

// The iOS Simulator has no camera, so launching it natively crashes the app.
export const isCameraAvailable = (): boolean => Device.isDevice;

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
