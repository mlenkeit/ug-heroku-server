'use strict';

const check = require('check-types');

check.assert.string(process.env.MONGODB_URI, 'Missing mandatory env var MONGODB_URI');
const MONGODB_URI = process.env.MONGODB_URI;
check.assert.string(process.env.PORT, 'Missing mandatory env var PORT');
const PORT = process.env.PORT;

const mongoConnect = require('./lib/model/mongo-connector')({
  url: MONGODB_URI
});

const travelRepo = require('./lib/model/mongo-repo')({
  connect: mongoConnect,
  collection: 'travel_destinations'
});

const app = require('./lib/app')({
  travelRepo: travelRepo
});

app.listen(PORT, () => {
});