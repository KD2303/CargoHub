const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Monorepo: explicitly set project root to this app directory
// (Metro defaults to the workspace root D:\CargoHub where node_modules lives,
//  which breaks index.js resolution)
const monorepoRoot = path.resolve(__dirname, '../..');
config.projectRoot = __dirname;
config.watchFolders = [monorepoRoot];

// Override unstable_serverRoot to __dirname to prevent Metro from resolving
// entry files relative to the monorepo root (D:\CargoHub) during production builds.
config.server = {
  ...config.server,
  unstable_serverRoot: __dirname,
};

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
