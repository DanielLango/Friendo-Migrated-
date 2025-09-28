module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-flow'
    ],
    plugins: [
      '@babel/plugin-transform-flow-strip-types',
      'react-native-reanimated/plugin',
    ],
  };
};