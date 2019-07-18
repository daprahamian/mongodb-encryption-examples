'use strict';

const assert = require('assert');
const { MongoClient } = require('mongodb');
const { ClientEncryption } = require('mongodb-client-encryption');

const {
  URL,
  dbName,
  dataManualCollectionName,
  kmsProviders,
  keyVaultNamespace,
  KMSKID,
  KMSKEY,
  KMSARN
} = require('./constants');

exports.manualEncryption = async function manualEncryption() {
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

    console.log('Creating data keys...');
    const key1 = await encryption.createDataKey('aws', {
      masterKey: { key: KMSARN, region: 'us-east-1' },
      keyAltNames: ['manualKey1']
    });
    const key2 = await encryption.createDataKey('aws', {
      masterKey: { key: KMSARN, region: 'us-east-1' },
      keyAltNames: ['manualKey2']
    });
    console.log('Data keys created:');
    console.log({ key1, key2 });

    console.log('Creating unencrypted document...');
    const doc = {
      firstName: 'Pat',
      lastName: 'Lee',
      medRecNum: 235498,
      ssn: '901-01-0001',
      mobile: '+1-212-555-1234',
      email: 'lee@example.com'
    };
    console.log('Unencrypted document created:');
    console.log(doc);

    console.log('Encryping document...');
    const encryptedSSN = await encryption.encrypt(doc.ssn, {
      keyId: key1,
      algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic'
    });
    const encryptedMoble = await encryption.encrypt(doc.mobile, {
      keyId: key2,
      algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random'
    });

    const encryptedDoc = Object.assign({}, doc, {
      ssn: encryptedSSN,
      mobile: encryptedMoble
    });
    console.log('Encrypted document:');
    console.log(encryptedDoc);

    const dataNamespace = `${dbName}.${dataManualCollectionName}`;
    const coll = client.db(dbName).collection(dataManualCollectionName);

    console.log(`Inserting encrypted document in to ${dataNamespace}`);
    await coll.insertOne(encryptedDoc);
    console.log('Document inserted.');

    let result;
    console.log('Querying for encrypted document by querying with encrypted ssn:');
    result = await coll.findOne({ ssn: encryptedSSN }, { projection: { _id: 0 } });
    result.ssn = await encryption.decrypt(result.ssn, {
      keyId: key1,
      algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic'
    });
    result.mobile = await encryption.decrypt(result.mobile, {
      keyId: key2,
      algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random'
    });
    assert.deepEqual(result, doc);
    console.log('Query successful.');

    console.log('Querying for encrypted document by querying with encrypted mobile:');
    result = await coll.findOne({ mobile: encryptedMoble }, { projection: { _id: 0 } });
    result.ssn = await encryption.decrypt(result.ssn, {
      keyId: key1,
      algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic'
    });
    result.mobile = await encryption.decrypt(result.mobile, {
      keyId: key2,
      algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random'
    });
    assert.deepEqual(result, doc);
    console.log('Query successful.');

    console.log('Querying for encrypted document by querying with newly-encrypted ssn:');
    let tmpSSN = await encryption.encrypt(doc.ssn, {
      keyId: key1,
      algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic'
    });
    result = await coll.findOne({ ssn: tmpSSN }, { projection: { _id: 0 } });
    result.ssn = await encryption.decrypt(result.ssn, {
      keyId: key1,
      algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic'
    });
    result.mobile = await encryption.decrypt(result.mobile, {
      keyId: key2,
      algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random'
    });
    assert.deepEqual(result, doc);
    console.log('Query successful.');

    console.log('Cannot query with values that were randomly encrypted:');
    let tmpMobile = await encryption.encrypt(doc.mobile, {
      keyId: key2,
      algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random'
    });
    result = await coll.findOne({ mobile: tmpMobile }, { projection: { _id: 0 } });
    assert.deepEqual(result, null);
    console.log('Query failed properly.');
  } finally {
    await client.close();
  }
};
