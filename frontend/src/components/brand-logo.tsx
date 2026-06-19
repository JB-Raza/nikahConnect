import { Image, StyleSheet, type ImageStyle, type StyleProp } from 'react-native';

const logo = require('@/assets/logo.png');

type BrandLogoProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export default function BrandLogo({ size = 28, style }: BrandLogoProps) {
  return (
    <Image
      source={logo}
      style={[styles.logo, { width: size, height: size }, style]}
      resizeMode="contain"
      accessibilityLabel="NikahConnect"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    backgroundColor: 'transparent',
  },
});
