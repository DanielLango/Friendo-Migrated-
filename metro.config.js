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

// Configure transformer to handle Flow syntax in node_modules
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');

// Ensure node_modules are transformed for Flow syntax
config.transformer.unstable_allowRequireContext = true;

module.exports = wrapWithReanimatedMetroConfig(config);
