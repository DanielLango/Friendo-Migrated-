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

// Ensure Babel processes node_modules for Flow syntax
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');

module.exports = wrapWithReanimatedMetroConfig(config);
