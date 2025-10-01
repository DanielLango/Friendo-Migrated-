import { getDefaultConfig } from '@expo/metro-config';

const config = getDefaultConfig(__dirname);

// Add web-specific resolver configuration
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add alias for problematic web modules
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  'react-native-web/dist/exports/NativeEventEmitter': 'react-native-web/dist/exports/DeviceEventEmitter',
};

// Ensure proper source extensions
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'web.js', 'web.ts', 'web.tsx'];

export default config;
