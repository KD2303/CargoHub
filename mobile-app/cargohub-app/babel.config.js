module.exports = function(api) {
  api.cache(true);
  console.log("=== LOADING DRIVER-APP BABEL CONFIG ===");
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
