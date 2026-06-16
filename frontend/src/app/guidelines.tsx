import { InfoBullet, InfoHeading, InfoParagraph, SettingsScaffold } from '@/components/settings-kit';

export default function GuidelinesScreen() {
  return (
    <SettingsScaffold title="Community guidelines">
      <InfoParagraph>
        NikahConnect is a community for Muslims seeking marriage with sincerity and respect. To keep everyone safe, we
        ask all members to follow these guidelines.
      </InfoParagraph>

      <InfoHeading>Be respectful</InfoHeading>
      <InfoBullet>Treat every member with kindness and dignity.</InfoBullet>
      <InfoBullet>No harassment, hate speech, or discrimination of any kind.</InfoBullet>
      <InfoBullet>Keep conversations halal and marriage-focused.</InfoBullet>

      <InfoHeading>Be genuine</InfoHeading>
      <InfoBullet>Use your real name, age, and recent photos of yourself.</InfoBullet>
      <InfoBullet>No fake, misleading, or impersonating profiles.</InfoBullet>
      <InfoBullet>Do not solicit money or promote external services.</InfoBullet>

      <InfoHeading>Stay safe</InfoHeading>
      <InfoBullet>Never share financial information or send money to anyone.</InfoBullet>
      <InfoBullet>Involve your family early, as is encouraged in the marriage process.</InfoBullet>
      <InfoBullet>Report anyone who makes you uncomfortable — reports are confidential.</InfoBullet>

      <InfoHeading>Enforcement</InfoHeading>
      <InfoParagraph>
        Violating these guidelines may lead to warnings, content removal, or a permanent ban. We review every report and
        take member safety seriously.
      </InfoParagraph>
    </SettingsScaffold>
  );
}
