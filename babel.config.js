module.exports = function(api) {
  api.cache(true);
  
  return {
    presets: [
      'babel-preset-expo',
      // Add Flow preset for node_modules
      ['@babel/preset-flow', { all: true }]
    ],
    plugins: [
      '@babel/plugin-syntax-flow',
      '@babel/plugin-transform-flow-strip-types',
      'react-native-reanimated/plugin',
    ],
    overrides: [
      {
        // For our TypeScript files, don't use Flow preset
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        presets: ['babel-preset-expo'],
        plugins: ['react-native-reanimated/plugin']
      },
      {
        // For node_modules, use Flow preset
        test: /node_modules/,
        presets: [
          'babel-preset-expo',
          ['@babel/preset-flow', { all: true }]
        ],
        plugins: [
          '@babel/plugin-syntax-flow',
          '@babel/plugin-transform-flow-strip-types'
        ]
      }
    ]
  };
};