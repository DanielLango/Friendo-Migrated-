module.exports = function(api) {
  api.cache(true);
  
  const presets = ['babel-preset-expo'];
  const plugins = ['react-native-reanimated/plugin'];
  
  // Add Flow support for all files
  presets.push(['@babel/preset-flow', { all: true }]);
  plugins.unshift('@babel/plugin-syntax-flow');
  
  return {
    presets,
    plugins,
  };
};