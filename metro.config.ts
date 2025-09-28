const { getDefaultConfig } = require('@expo/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure Flow syntax is supported
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'flow'];

// Clear any cached configurations
config.resetCache = true;

module.exports = wrapWithReanimatedMetroConfig(config);