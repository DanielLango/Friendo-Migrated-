const { getDefaultConfig } = require('@expo/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

const config = getDefaultConfig(__dirname);

// Enable Flow syntax support
config.resolver.sourceExts = [...config.resolver.sourceExts, 'flow'];

module.exports = wrapWithReanimatedMetroConfig(config);