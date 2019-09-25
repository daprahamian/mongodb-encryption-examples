'use strict';

const mongodb = require('mongodb');
const { ClientEncryption } = require('mongodb-client-encryption')(mongodb);
const { MongoClient } = mongodb;

const {
  URL,
  dbName,
  keyVaultCollectionName,
  keyVaultNamespace,
  kmsProviders,
  KMSARN
} = require('./constants');

exports.createKeys = async function createKeys() {
  console.log(`Connecting to "${URL}"...`);
  const client = new MongoClient(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  await client.connect();
  console.log('Connected.');

  try {
    const encryption = new ClientEncryption(client, {
      keyVaultNamespace,
      kmsProviders
    });
    const keyVaultCollection = client.db(dbName).collection(keyVaultCollectionName);

    console.log('Creating data keys...');
    const key1 = await encryption.createDataKey('aws', {
      masterKey: { key: KMSARN, region: 'us-east-1' },
      keyAltNames: ['key1']
    });
    const key2 = await encryption.createDataKey('aws', {
      masterKey: { key: KMSARN, region: 'us-east-1' },
      keyAltNames: ['key2']
    });
    console.log('Data keys created:');
    console.log({ key1, key2 });

    // TODO: implement lookup with keyAltNames
    // console.log("Retrieve new field key UUID using FLE API direct collection query...")
    // const keyDoc = await keyVaultCollection.findOne({ keyAltNames: "key1" });
    // var key1 = (await keyVaultCollection.findOne({ keyAltNames: "key1" }))._id
    // console.log( "key1 UUID: ", key1, "\n" )
    // var key2 = (await keyVaultCollection.findOne({ keyAltNames: "key1" }))._id
    // console.log( "key1 UUID: ", key1, "\n" )

    console.log('Retrieve all keystore contents using API direct collection query...');
    const allKeys = await keyVaultCollection.find().toArray();
    console.log('All keys:');
    console.dir(allKeys, { depth: 2 });

    return { key1, key2 };
  } finally {
    await client.close();
  }
};
