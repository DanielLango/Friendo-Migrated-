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

// Force transformation of ALL files, including node_modules
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Override the default behavior to transform node_modules
config.transformer.enableBabelRCLookup = false;
config.transformer.enableBabelRuntime = false;

// Force transformation of node_modules by overriding the transform filter
const originalTransform = config.transformer.transform;
config.transformer.transform = {
  ...originalTransform,
  // Apply transformations to all files, including node_modules
  unstable_transform: {
    ...originalTransform?.unstable_transform,
    // Force transformation of Flow files in node_modules
    forceTransformNodeModules: true,
  }
};

module.exports = wrapWithReanimatedMetroConfig(config);