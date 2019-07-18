'use strict';

const assert = require('assert');
const { MongoClient } = require('mongodb');
const {
  URL,
  dbName,
  dataAutoCollectionName,
  keyVaultNamespace,
  kmsProviders
} = require('./constants');

exports.autoEncryption = async function autoEncryption({ key1, key2 }) {
  const dataNamespace = `${dbName}.${dataAutoCollectionName}`;
  const patientSchema = {
    [dataNamespace]: {
      bsonType: 'object',
      properties: {
        firstName: { bsonType: 'string' },
        lastName: { bsonType: 'string' },
        ssn: {
          encrypt: {
            bsonType: 'string',
            algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic',
            keyId: [key1]
          }
        },
        mobile: {
          encrypt: {
            bsonType: 'string',
            algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random',
            keyId: [key2]
          }
        }
      }
    }
  };

  var serverPatientSchema = {
    bsonType: 'object',
    properties: {
      medRecNum: { bsonType: 'int' },
      firstName: { bsonType: 'string' },
      lastName: { bsonType: 'string' },
      ssn: {
        encrypt: {
          bsonType: 'string',
          algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic',
          keyId: [key1]
        }
      },
      mobile: {
        description:
          'If this entry is ommitted, *client-side-enforced* config is required to enforce encryption'
      },
      email: { description: 'This entry could be safely ommitted' }
    }
  };

  console.log(`Connecting to "${URL}" with autoEncryption...`);
  const client = new MongoClient(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    monitorCommands: true,
    autoEncryption: { keyVaultNamespace, kmsProviders, schemaMap: patientSchema }
  });
  await client.connect();
  console.log('Connected.');

  try {
    const db = client.db(dbName);

    console.log(
      `Creating "${dataAutoCollectionName}" collection with server-enforced encryption... `
    );
    await db.createCollection(dataAutoCollectionName, {
      validator: { $jsonSchema: serverPatientSchema }
    });
    const coll = db.collection(dataAutoCollectionName);
    console.log(`Collection "${dataAutoCollectionName}" created`);

    console.log('Attempting to insert a document using transparent encryption...');
    const doc = {
      firstName: 'Pat',
      lastName: 'Lee',
      medRecNum: 235498,
      ssn: '901-01-0001',
      mobile: '+1-212-555-1234',
      email: 'lee@example.com'
    };
    await coll.insertOne(doc);
    console.log('Document inserted');

    console.log('Querying on ssn...');
    const result = await coll.findOne({ ssn: doc.ssn });
    assert.deepEqual(result, doc);
    console.log('Query Successful');

    // Do other autoEncrypt examples here here
  } finally {
    await client.close();
  }
};
