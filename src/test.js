'use strict';

const { KMSKID, KMSKEY, KMSARN } = require('./constants');
console.log({ KMSKID, KMSKEY, KMSARN });

const { setupEnvironment } = require('./setupEnvironment');
const { createKeys } = require('./createKeys');
const { manualEncryption } = require('./manualEncryption');
const { autoEncryption } = require('./autoEncryption');

(async () => {
  try {
    console.group('Setting up environment...');
    await setupEnvironment();
    console.groupEnd();
    console.log('Environment setup complete.');

    console.group('Running createKeys example...');
    const keys = await createKeys();
    console.groupEnd();
    console.log('createKeys complete.');

    console.group('Running manualEncryption example...');
    await manualEncryption();
    console.groupEnd();
    console.log('manualEncryption complete.');

    console.group('Running autoEncryption example...');
    await autoEncryption(keys);
    console.groupEnd();
    console.log('autoEncryption complete.');
  } catch (e) {
    console.log('Failed with error:');
    console.log(e);
  }
})();
