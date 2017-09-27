'use strict';

const check = require('check-types');
const MongoClient = require('mongodb').MongoClient;

module.exports = function(config) {
  check.assert.string(config.url, 'config.url must be of type string');
  const url = config.url;
  
  let whenConnected;
  
  return function() {
    return new Promise(function(resolve, reject) {
      if (!whenConnected) {
        whenConnected = MongoClient.connect(url);
        whenConnected.then(db => {
          db.on('close', () => whenConnected = null);
        }).catch(reject);
      }
      return resolve(whenConnected);
    });
  };
};