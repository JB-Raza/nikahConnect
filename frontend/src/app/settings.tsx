import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { SettingsRow, SettingsScaffold, SettingsSection } from '@/components/settings-kit';

const LANGUAGES = ['English', 'اردو (Urdu)', 'العربية (Arabic)', 'Türkçe (Turkish)', 'Bahasa (Malay)'];

export default function SettingsScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState('English');
  const [units, setUnits] = useState<'km' | 'mi'>('km');

  const chooseLanguage = () =>
    Alert.alert('App language', undefined, [
      ...LANGUAGES.map((lang) => ({ text: lang, onPress: () => setLanguage(lang) })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);

  return (
    <SettingsScaffold title="Settings">
      <SettingsSection title="Preferences">
        <SettingsRow icon="language-outline" label="App language" value={language} onPress={chooseLanguage} />
        <SettingsRow
          icon="navigate-outline"
          label="Distance units"
          value={units === 'km' ? 'Kilometers' : 'Miles'}
          onPress={() => setUnits((current) => (current === 'km' ? 'mi' : 'km'))}
        />
        <SettingsRow icon="contrast-outline" label="Appearance" value="Light" showChevron={false} />
      </SettingsSection>

      <SettingsSection title="Notifications">
        <SettingsRow icon="options-outline" label="Notification preferences" onPress={() => router.push('/notification-preferences')} />
      </SettingsSection>

      <SettingsSection title="About">
        <SettingsRow icon="document-text-outline" label="Terms & Privacy" onPress={() => router.push('/legal')} />
        <SettingsRow icon="people-outline" label="Community guidelines" onPress={() => router.push('/guidelines')} />
        <SettingsRow icon="information-circle-outline" label="About NikahConnect" value="v1.0.0" onPress={() => router.push('/about')} />
      </SettingsSection>
    </SettingsScaffold>
  );
}
