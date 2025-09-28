module.exports = function(api) {
  // Disable caching completely to ensure fresh config
  api.cache(false);
  
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-flow'
    ],
    plugins: [
      '@babel/plugin-syntax-flow',
      'react-native-reanimated/plugin'
    ],
    overrides: [
      {
        test: /\.tsx?$/,
        presets: [
          'babel-preset-expo',
          '@babel/preset-flow'
        ]
      }
    ]
  };
};