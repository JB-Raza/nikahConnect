import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ImageSourcePropType,
} from 'react-native';

import { SettingsScaffold, settingsPalette } from '@/components/settings-kit';
import { currentUser } from '@/features/menu/data';
import { radius, spacing, typography } from '@/theme/theme';

const palette = settingsPalette;
const AVATAR_SIZE = 104;

const INTEREST_POOL = ['Reading', 'Travel', 'Cooking', 'Fitness', 'Volunteering', 'Calligraphy', 'Hiking', 'Photography'];

export default function EditProfileScreen() {
  const router = useRouter();

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState('Practising and family-oriented, looking for a partner to grow in deen with, insha’Allah.');
  const [occupation, setOccupation] = useState('Software Engineer');
  const [city, setCity] = useState(currentUser.city);
  const [country, setCountry] = useState(currentUser.country);
  const [height, setHeight] = useState('178');
  const [interests, setInterests] = useState<string[]>(['Reading', 'Travel', 'Fitness']);

  const avatarSource: ImageSourcePropType = avatarUri ? { uri: avatarUri } : currentUser.photo;

  const changePhoto = () => {
    Alert.alert('Update profile photo', 'Choose where to get your new picture from.', [
      { text: 'Take a photo', onPress: takePhoto },
      { text: 'Choose from gallery', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Enable camera access for NikahConnect in Settings to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photos access needed', 'Enable photo access for NikahConnect in Settings to choose a picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const toggleInterest = (interest: string) =>
    setInterests((current) =>
      current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest],
    );

  const save = () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    Alert.alert('Profile saved', 'Your changes have been updated.', [{ text: 'Done', onPress: () => router.back() }]);
  };

  return (
    <SettingsScaffold
      title="Edit profile"
      footer={
        <Pressable onPress={save} style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.9 }]}>
          <Text style={styles.saveLabel}>Save changes</Text>
        </Pressable>
      }>
      <View style={styles.avatarBlock}>
        <View style={styles.avatarWrap}>
          <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />
          <Pressable onPress={changePhoto} hitSlop={8} style={styles.cameraButton} accessibilityLabel="Change profile photo">
            <Ionicons name="camera" size={16} color={palette.textOnPrimary} />
          </Pressable>
        </View>
        <Pressable onPress={changePhoto} hitSlop={6}>
          <Text style={styles.changePhotoText}>Change photo</Text>
        </Pressable>
      </View>

      <View style={styles.form}>
        <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />
        <Field
          label="About me"
          value={bio}
          onChangeText={setBio}
          placeholder="Tell others about yourself"
          multiline
        />
        <Field label="Occupation" value={occupation} onChangeText={setOccupation} placeholder="What do you do?" />
        <View style={styles.row}>
          <View style={styles.flex}>
            <Field label="City" value={city} onChangeText={setCity} placeholder="City" />
          </View>
          <View style={styles.flex}>
            <Field label="Country" value={country} onChangeText={setCountry} placeholder="Country" />
          </View>
        </View>
        <Field label="Height (cm)" value={height} onChangeText={setHeight} placeholder="e.g. 178" keyboardType="number-pad" />

        <Text style={styles.fieldLabel}>Interests</Text>
        <View style={styles.chips}>
          {INTEREST_POOL.map((interest) => {
            const active = interests.includes(interest);
            return (
              <Pressable
                key={interest}
                onPress={() => toggleInterest(interest)}
                style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{interest}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SettingsScaffold>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'number-pad';
};

function Field({ label, value, onChangeText, placeholder, multiline, keyboardType = 'default' }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.textSecondary}
        multiline={multiline}
        keyboardType={keyboardType}
        style={[styles.input, multiline && styles.inputMultiline]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatarBlock: {
    alignItems: 'center',
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: palette.chipSurfaceSoft,
    borderWidth: 3,
    borderColor: palette.surface,
  },
  cameraButton: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: palette.background,
  },
  changePhotoText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: palette.primary,
  },
  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textSecondary,
    marginLeft: spacing.xxs,
  },
  input: {
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textPrimary,
    minHeight: 50,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  chipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  chipText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  chipTextActive: {
    color: palette.textOnPrimary,
  },
  saveButton: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveLabel: {
    fontSize: typography.button,
    fontWeight: '700',
    color: palette.textOnPrimary,
  },
});
