const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');
const { getDefaultConfig } = require('@expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // Force clear cache
  resetCache: true,
});

// Ensure proper resolver configuration
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.unstable_enablePackageExports = true;

// Clear asset cache
config.transformer.assetExts = [...config.transformer.assetExts];

module.exports = wrapWithReanimatedMetroConfig(config);
