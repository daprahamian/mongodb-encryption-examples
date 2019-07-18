'use strict';

const URL = process.env.URL || 'mongodb://localhost:27017/';
const { KMSKID, KMSKEY, KMSARN } = process.env;
const dbName = 'test';
const dataAutoCollectionName = 'patients1';
const dataManualCollectionName = 'patients2';
const keyVaultCollectionName = 'encryption';
const keyVaultNamespace = `${dbName}.${keyVaultCollectionName}`;
const kmsProviders = {
  aws: {
    accessKeyId: KMSKID,
    secretAccessKey: KMSKEY
  }
};

module.exports = {
  URL,
  dbName,
  dataAutoCollectionName,
  dataManualCollectionName,
  keyVaultCollectionName,
  keyVaultNamespace,
  kmsProviders,
  KMSKID,
  KMSKEY,
  KMSARN
};
