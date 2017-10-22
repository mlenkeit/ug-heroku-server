'use strict';

const check = require('check-types');

module.exports = function(config) {
  check.assert.string(config.collection, 'config.collection must be of type string');
  const collection = config.collection;
  check.assert.function(config.connect, 'config.connect must be of type function');
  const connect = config.connect;
  
  const repo = {
    findOneById: id => {
      return connect()
        .then(db => db.collection(collection))
        .then(col => col.findOne({ _id: id }));
    },
    update: doc => {
      return connect()
        .then(db => db.collection(collection))
        .then(col => {
          const filter = doc._id ? { _id: doc._id } : doc;
          const update = { $set: doc };
          const options = { upsert: true };
          return col.updateOne(filter, update, options);
        })
        .then(newDoc => doc._id || newDoc.upsertedId._id)
        .then(id => repo.findOneById(id));
    }
  };
  
  return repo;
};