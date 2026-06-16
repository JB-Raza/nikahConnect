import { InfoHeading, InfoParagraph, SettingsScaffold } from '@/components/settings-kit';

export default function LegalScreen() {
  return (
    <SettingsScaffold title="Terms & Privacy">
      <InfoParagraph>Last updated: June 2026</InfoParagraph>

      <InfoHeading>Terms of Service</InfoHeading>
      <InfoParagraph>
        By creating an account, you agree to use NikahConnect respectfully and lawfully for the genuine purpose of
        seeking marriage. You must be at least 18 years old and provide accurate information about yourself.
      </InfoParagraph>
      <InfoParagraph>
        You are responsible for your conduct and content. We may suspend or terminate accounts that violate our
        community guidelines or these terms.
      </InfoParagraph>

      <InfoHeading>Privacy Policy</InfoHeading>
      <InfoParagraph>
        We collect the information you provide (such as your profile, photos, and preferences) to operate the
        matchmaking service and keep you safe. Your verification selfie is used only to confirm your identity and is
        never shown on your profile.
      </InfoParagraph>
      <InfoParagraph>
        We never sell your personal data. You can request a copy of your data or delete your account at any time from
        Account settings.
      </InfoParagraph>

      <InfoHeading>Your choices</InfoHeading>
      <InfoParagraph>
        You control your visibility, notifications, and privacy settings in the app. Contact our support team if you
        have any questions about how your data is handled.
      </InfoParagraph>
    </SettingsScaffold>
  );
}
