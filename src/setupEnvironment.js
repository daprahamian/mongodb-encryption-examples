'use strict';

const { MongoClient } = require('mongodb');
const {
  URL,
  dbName,
  dataAutoCollectionName,
  dataManualCollectionName,
  keyVaultCollectionName
} = require('./constants');

exports.setupEnvironment = async function setupEnvironment() {
  const client = new MongoClient(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  await client.connect();

  try {
    await client
      .db(dbName)
      .dropCollection(dataAutoCollectionName)
      .catch(() => {});
    await client
      .db(dbName)
      .dropCollection(dataManualCollectionName)
      .catch(() => {});
    await client
      .db(dbName)
      .dropCollection(keyVaultCollectionName)
      .catch(() => {});
    await client.db('admin').command({ setFeatureCompatibilityVersion: '4.2' });
  } finally {
    await client.close();
  }
};
