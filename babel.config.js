module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
    overrides: [
      {
        test: /node_modules/,
        presets: ['@babel/preset-flow'],
        plugins: ['@babel/plugin-syntax-flow'],
      },
    ],
  };
};
