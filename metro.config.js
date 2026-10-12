const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/** @type {import('@react-native/metro-config').MetroConfig} */
const config = {
  resolver: {
    // Keep Metro from walking into native build output.
    blockList: [/\/android\/.*\/build\/.*/, /\/ios\/build\/.*/, /\/ios\/Pods\/.*/],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
