import { useState } from 'react';

import { SettingsScaffold, SettingsSection, SettingsToggle } from '@/components/settings-kit';

export default function NotificationPreferencesScreen() {
  const [prefs, setPrefs] = useState({
    matches: true,
    messages: true,
    likes: true,
    compliments: true,
    profileViews: false,
    promotions: false,
    productUpdates: true,
    safety: true,
  });

  const set = (key: keyof typeof prefs) => (next: boolean) => setPrefs((current) => ({ ...current, [key]: next }));

  return (
    <SettingsScaffold title="Notifications">
      <SettingsSection title="Push notifications">
        <SettingsToggle icon="heart-outline" label="New matches" value={prefs.matches} onChange={set('matches')} />
        <SettingsToggle icon="chatbubble-outline" label="New messages" value={prefs.messages} onChange={set('messages')} />
        <SettingsToggle icon="thumbs-up-outline" label="New likes" value={prefs.likes} onChange={set('likes')} />
        <SettingsToggle icon="sparkles-outline" label="Compliments" value={prefs.compliments} onChange={set('compliments')} />
        <SettingsToggle
          icon="eye-outline"
          label="Profile views"
          description="Get notified when someone views your profile"
          value={prefs.profileViews}
          onChange={set('profileViews')}
        />
      </SettingsSection>

      <SettingsSection title="Email">
        <SettingsToggle icon="pricetag-outline" label="Promotions & offers" value={prefs.promotions} onChange={set('promotions')} />
        <SettingsToggle icon="megaphone-outline" label="Product updates" value={prefs.productUpdates} onChange={set('productUpdates')} />
        <SettingsToggle
          icon="shield-checkmark-outline"
          label="Safety alerts"
          description="Important account and safety notices"
          value={prefs.safety}
          onChange={set('safety')}
        />
      </SettingsSection>
    </SettingsScaffold>
  );
}
