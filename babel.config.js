module.exports = function(api) {
  api.cache(false); // Disable caching to ensure fresh config
  
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-flow'
    ],
    plugins: [
      'react-native-reanimated/plugin'
    ],
  };
};