module.exports = function(api) {
  api.cache(false);
  
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-flow'
    ],
    plugins: [
      '@babel/plugin-syntax-flow',
      'react-native-reanimated/plugin'
    ]
  };
};