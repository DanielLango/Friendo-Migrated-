const { getDefaultConfig } = require('@expo/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

const config = getDefaultConfig(__dirname);

// Add Flow support
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'flow'];
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');

module.exports = wrapWithReanimatedMetroConfig(config);