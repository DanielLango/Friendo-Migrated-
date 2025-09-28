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

// Configure transformer to handle Flow syntax everywhere including node_modules
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');
config.transformer.unstable_allowRequireContext = true;

// Force transformation of node_modules for Flow syntax
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Ensure all files are transformed, including node_modules
config.transformer.enableBabelRCLookup = false;
config.transformer.enableBabelRuntime = false;

module.exports = wrapWithReanimatedMetroConfig(config);