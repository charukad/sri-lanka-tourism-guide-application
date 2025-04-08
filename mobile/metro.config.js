const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Minimal configuration
config.resolver = {
  ...config.resolver,
  assetExts: [...config.resolver.assetExts],
  sourceExts: [...config.resolver.sourceExts]
};

// Configure transformer
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer')
};

module.exports = config; 