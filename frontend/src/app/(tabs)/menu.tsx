import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GradientButton from '@/components/gradient-button';
import IconCircleButton from '@/components/icon-circle-button';
import VerifiedStar from '@/components/verified-star';
import { useAlert } from '@/features/alerts/alert-provider';
import { capturePhoto } from '@/features/media/camera';
import { useUserProfile } from '@/features/profile/user-profile-context';
import { colors, radius, spacing, typography } from '@/theme/theme';

const palette = colors.light;
const TAB_BAR_HEIGHT = 78;
const AVATAR_SIZE = 96;

export default function MenuTabScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showAlert, showToast, showActionSheet, showPicker } = useAlert();
  const { user, name, age, photo, completionPercent, patchProfile } = useUserProfile();

  const [hideOnlineStatus, setHideOnlineStatus] = useState(false);
  const [blurPhotos, setBlurPhotos] = useState(false);
  const [hideFromSearch, setHideFromSearch] = useState(false);
  const [whoCanMessage, setWhoCanMessage] = useState('Everyone');

  const avatarSource: ImageSourcePropType = photo;

  const updatePrimaryPhoto = (uri: string | null) => {
    const rest = user.profile.photos.slice(1);
    patchProfile({ photos: uri ? [uri, ...rest] : rest });
  };

  const takePhoto = async () => {
    const result = await capturePhoto({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    switch (result.status) {
      case 'unsupported':
        showAlert({
          type: 'info',
          title: 'Camera unavailable',
          message: 'The simulator has no camera. Use a real device to take a photo, or choose from your gallery.',
        });
        return;
      case 'denied':
        showAlert({
          type: 'warning',
          title: 'Camera access needed',
          message: 'Enable camera access for NikahConnect in Settings to take a photo.',
        });
        return;
      case 'error':
        showToast({ type: 'error', message: 'Could not open the camera.' });
        return;
      case 'success':
        updatePrimaryPhoto(result.uri);
        return;
    }
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert({
        type: 'warning',
        title: 'Photos access needed',
        message: 'Enable photo access for NikahConnect in Settings to choose a picture.',
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      updatePrimaryPhoto(result.assets[0].uri);
    }
  };

  const changePhoto = () => {
    showActionSheet({
      title: 'Update profile photo',
      message: 'Choose where to get your new picture from.',
      actions: [
        { label: 'Take a photo', icon: 'camera', onPress: takePhoto },
        { label: 'Choose from gallery', icon: 'images', onPress: pickFromGallery },
        ...(user.profile.photos[0]
          ? [{ label: 'Remove photo', icon: 'trash' as const, style: 'destructive' as const, onPress: () => updatePrimaryPhoto(null) }]
          : []),
      ],
    });
  };

  const chooseWhoCanMessage = () =>
    showPicker({
      title: 'Who can message me',
      options: ['Everyone', 'Matches only', 'Verified members'],
      selected: whoCanMessage,
      onSelect: setWhoCanMessage,
    });

  const confirmLogout = () =>
    showAlert({
      type: 'warning',
      title: 'Log out',
      message: 'Are you sure you want to log out?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: () => router.replace('/') },
      ],
    });

  const confirmDelete = () =>
    showAlert({
      type: 'error',
      title: 'Delete account',
      message: 'This permanently removes your profile and matches. This cannot be undone.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => router.replace('/') },
      ],
    });

  const completionLabel = completionPercent;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.xs }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
        <IconCircleButton icon="settings-outline" onPress={() => router.push('/settings')} accessibilityLabel="Settings" variant="onLight" size={40} iconSize={22} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_HEIGHT + spacing.xl }}>
        <View style={styles.profileBlock}>
          <View style={styles.avatarWrap}>
            <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />
            <Pressable
              onPress={changePhoto}
              hitSlop={8}
              style={({ pressed }) => [styles.cameraButton, pressed && { opacity: 0.85 }]}
              accessibilityLabel="Change profile photo">
              <Ionicons name="camera" size={16} color={palette.textOnPrimary} />
            </Pressable>
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.name}>{name}</Text>
            {age ? <Text style={styles.age}>{age}</Text> : null}
            {user.isVerified ? <VerifiedStar size={16} /> : null}
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={palette.textSecondary} />
            <Text style={styles.location}>
              {user.profile.city}, {user.profile.country}
            </Text>
          </View>

          <View style={styles.completionCard}>
            <View style={styles.completionTextRow}>
              <Text style={styles.completionLabel}>Profile {completionLabel}% complete</Text>
              <Pressable hitSlop={6} onPress={() => router.push('/edit-profile')}>
                <Text style={styles.completionCta}>Complete</Text>
              </Pressable>
            </View>
            <View style={styles.completionTrack}>
              <View style={[styles.completionFill, { width: `${completionPercent}%` }]} />
            </View>
          </View>

          <GradientButton
            label="View my profile"
            icon="eye-outline"
            onPress={() => router.push(`/profile/${user.id}`)}
            style={styles.viewProfileButton}
          />
        </View>

        <Pressable
          onPress={() => router.push('/premium')}
          style={({ pressed }) => [styles.premiumCard, pressed && { opacity: 0.92 }]}>
          <View style={styles.premiumIcon}>
            <Ionicons name="diamond" size={20} color={palette.textOnPrimary} />
          </View>
          <View style={styles.premiumTextWrap}>
            <Text style={styles.premiumTitle}>NikahConnect Premium</Text>
            <Text style={styles.premiumSubtitle}>See who liked you, unlimited likes & more</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={palette.textSecondary} />
        </Pressable>

        <MenuSection title="Discover">
          <MenuRow icon="heart-outline" label="Likes you" value="8" onPress={() => router.push('/likes')} />
          <MenuRow icon="flash-outline" label="Boost your profile" onPress={() => router.push('/boost')} />
        </MenuSection>

        <MenuSection title="Account">
          <MenuRow icon="create-outline" label="Edit profile" onPress={() => router.push('/edit-profile')} />
          <MenuRow icon="mail-outline" label="Account settings" onPress={() => router.push('/account-settings')} />
          <MenuRow
            icon="shield-checkmark-outline"
            label="Verification"
            value={user.isVerified ? 'Verified' : 'Verify now'}
            valueTint={user.isVerified ? palette.success : palette.warning}
            onPress={() => router.push('/verification')}
          />
        </MenuSection>

        <MenuSection title="Privacy & Safety">
          <ToggleRow
            icon="eye-off-outline"
            label="Hide online status"
            value={hideOnlineStatus}
            onChange={setHideOnlineStatus}
          />
          <ToggleRow icon="image-outline" label="Blur my photos" value={blurPhotos} onChange={setBlurPhotos} />
          <ToggleRow
            icon="search-outline"
            label="Hide profile from search"
            value={hideFromSearch}
            onChange={setHideFromSearch}
          />
          <MenuRow
            icon="chatbubble-ellipses-outline"
            label="Who can message me"
            value={whoCanMessage}
            onPress={chooseWhoCanMessage}
          />
          <MenuRow icon="ban-outline" label="Blocked users" onPress={() => router.push('/blocked-users')} />
        </MenuSection>

        <MenuSection title="Notifications">
          <MenuRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() => router.push('/notifications')}
          />
          <MenuRow
            icon="options-outline"
            label="Notification preferences"
            onPress={() => router.push('/notification-preferences')}
          />
        </MenuSection>

        <MenuSection title="Support">
          <MenuRow icon="help-circle-outline" label="Help & support" onPress={() => router.push('/help')} />
          <MenuRow icon="people-outline" label="Community guidelines" onPress={() => router.push('/guidelines')} />
          <MenuRow icon="document-text-outline" label="Terms & Privacy" onPress={() => router.push('/legal')} />
          <MenuRow icon="information-circle-outline" label="About" value="v1.0.0" onPress={() => router.push('/about')} />
        </MenuSection>

        <MenuSection title="Account actions">
          <MenuRow icon="log-out-outline" label="Log out" tint={palette.warning} onPress={confirmLogout} showChevron={false} />
          <MenuRow
            icon="trash-outline"
            label="Delete account"
            tint={palette.danger}
            danger
            onPress={confirmDelete}
            showChevron={false}
          />
        </MenuSection>
      </ScrollView>
    </View>
  );
}

type MenuSectionProps = {
  title: string;
  children: React.ReactNode;
};

function MenuSection({ title, children }: MenuSectionProps) {
  const items = React.Children.toArray(children);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((child, index) => (
          <View key={index}>
            {index > 0 ? <View style={styles.divider} /> : null}
            {child}
          </View>
        ))}
      </View>
    </View>
  );
}

type MenuRowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value?: string;
  valueTint?: string;
  tint?: string;
  danger?: boolean;
  showChevron?: boolean;
  onPress?: () => void;
};

function MenuRow({ icon, label, value, valueTint, tint, danger, showChevron = true, onPress }: MenuRowProps) {
  const iconColor = tint ?? palette.primary;
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={onPress}>
      <View style={[styles.rowIcon, { backgroundColor: `${iconColor}1a` }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[styles.rowLabel, danger && { color: palette.danger }]}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={[styles.rowValue, valueTint ? { color: valueTint } : null]}>{value}</Text> : null}
        {showChevron ? <Ionicons name="chevron-forward" size={18} color={palette.textSecondary} /> : null}
      </View>
    </Pressable>
  );
}

type ToggleRowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
};

function ToggleRow({ icon, label, value, onChange }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: `${palette.primary}1a` }]}>
        <Ionicons name={icon} size={18} color={palette.primary} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: palette.border, true: palette.primary }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.title,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
  },
  profileBlock: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    marginBottom: spacing.sm,
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
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: palette.background,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    fontSize: typography.titleMd,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  age: {
    fontSize: typography.titleMd,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginTop: spacing.xxs,
  },
  location: {
    fontSize: typography.body,
    fontWeight: '500',
    color: palette.textSecondary,
  },
  completionCard: {
    alignSelf: 'stretch',
    marginTop: spacing.lg,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  completionTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completionLabel: {
    fontSize: typography.body,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  completionCta: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.primary,
  },
  completionTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: palette.chipSurfaceSoft,
    overflow: 'hidden',
  },
  completionFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
  },
  viewProfileButton: {
    alignSelf: 'stretch',
    marginTop: spacing.md,
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: palette.premiumSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.premiumBorder,
  },
  premiumIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: palette.premiumAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumTextWrap: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: typography.subtitle,
    fontWeight: '800',
    color: palette.textPrimary,
  },
  premiumSubtitle: {
    fontSize: typography.caption,
    fontWeight: '500',
    color: palette.textSecondary,
    marginTop: 2,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: palette.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
    marginLeft: spacing.xxs,
  },
  sectionCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 56,
  },
  rowPressed: {
    backgroundColor: palette.chipSurfaceSoft,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.border,
    marginLeft: spacing.md + 34 + spacing.sm,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  rowValue: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: palette.textSecondary,
  },
});
