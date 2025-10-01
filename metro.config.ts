import { getDefaultConfig } from '@expo/metro-config';

const config = getDefaultConfig(__dirname);

// Web-specific resolver configuration
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add resolver alias for web platform
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  // Mock NativeEventEmitter for web
  'react-native-web/dist/exports/NativeEventEmitter': require.resolve('./web-polyfills/NativeEventEmitter.web.js'),
};

// Ensure proper source extensions
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'web.js', 'web.ts', 'web.tsx'];

export default config;
