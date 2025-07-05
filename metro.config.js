const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const {
    wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');


let config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('sql');

config = withNativeWind(config, { input: './app/globals.css' });


config = wrapWithReanimatedMetroConfig(config);

module.exports = config;
