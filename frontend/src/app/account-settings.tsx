import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { SettingsRow, SettingsScaffold, SettingsSection, SettingsToggle } from '@/components/settings-kit';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const [pauseAccount, setPauseAccount] = useState(false);

  const comingSoon = (label: string) => Alert.alert(label, 'This option will be available soon.');

  const confirmLogout = () =>
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => router.replace('/') },
    ]);

  const confirmDelete = () =>
    Alert.alert('Delete account', 'This permanently removes your profile and matches. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => router.replace('/') },
    ]);

  return (
    <SettingsScaffold title="Account settings">
      <SettingsSection title="Login details">
        <SettingsRow icon="mail-outline" label="Email" value="ahmed@example.com" onPress={() => comingSoon('Change email')} />
        <SettingsRow icon="call-outline" label="Phone number" value="+92 300 1234567" onPress={() => comingSoon('Change phone')} />
        <SettingsRow icon="lock-closed-outline" label="Change password" onPress={() => comingSoon('Change password')} />
      </SettingsSection>

      <SettingsSection title="Account">
        <SettingsToggle
          icon="pause-circle-outline"
          label="Pause my account"
          description="Hide your profile without deleting it"
          value={pauseAccount}
          onChange={setPauseAccount}
        />
        <SettingsRow icon="download-outline" label="Download my data" onPress={() => comingSoon('Download my data')} />
      </SettingsSection>

      <SettingsSection title="Danger zone">
        <SettingsRow icon="log-out-outline" label="Log out" tint="#b26c18" showChevron={false} onPress={confirmLogout} />
        <SettingsRow icon="trash-outline" label="Delete account" tint="#bb2f2f" danger showChevron={false} onPress={confirmDelete} />
      </SettingsSection>
    </SettingsScaffold>
  );
}
