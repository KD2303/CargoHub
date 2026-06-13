const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /.*\.npm-cache.*/,
  /.*\.git.*/,
  /.*\.expo.*/,
  /.*\.planning.*/,
  /.*[/\\]frontend[/\\]admin-dashboard[/\\].*/,
  /.*[/\\]frontend[/\\]customer-portal[/\\].*/,
  /.*[/\\]frontend[/\\]b2b-portal[/\\].*/,
  /.*[/\\]backend[/\\](?!src[/\\]shared).*/,
];

const metroResolver = require('metro-resolver');
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      type: 'empty',
    };
  }
  return metroResolver.resolve(context, moduleName, platform);
};

module.exports = config;
