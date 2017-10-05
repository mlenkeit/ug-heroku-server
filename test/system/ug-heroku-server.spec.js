'use strict';

const async = require('async');
const exec = require('child_process').exec;
const expect = require('chai').expect;
const kill = require('tree-kill');
const path = require('path');
const rp = require('request-promise-native');

const start = function() {
  return new Promise((resolve, reject) => {
    const cp = exec('node index.js', {
      cwd: path.resolve(__dirname, './../..'),
      env: process.env
    });
    cp.stdout.on('data', function(data) {
      console.log(data);
      if (/started/i.test(data.toString())) {
        resolve(cp);
      }
    });
    cp.stderr.on('data', console.log);
    cp.stderr.on('data', reject);
  });
};

describe('System Test', function() {
  
  beforeEach(function() {
    this.cps = [];
    
    this.mongoConnect = require('./../../lib/model/mongo-connector')({
      url: 'mongodb://localhost:27017'
    });
    this.collection = 'travel_destinations';
  });

  afterEach(function(done) {
    async.each(this.cps, function(cp, cb) {
      var pid = cp.pid;
      kill(pid, 'SIGKILL', function(/*err*/) {
        cb();
      });
    }, done);
  });
  
  afterEach(function() {
    return this.mongoConnect()
      .then(db => db.collection(this.collection))
      .then(col => col.deleteMany());
  });
  
  describe('travel destination', function() {
    
    it('create redirect destination and read it', function() {
      return start()
        .then(cp => {
          this.cps.push(cp);
        })
        .then(() => {
          return rp.put({
            uri: `http://localhost:${process.env.PORT}/travel/traviscistatus`,
            json: {
              name: 'traviscistatus',
              destination: 'https://www.traviscistatus.com/',
              type: 'redirect'
            }
          });
        })
        .then(() => {
          return rp.get({
            uri: `http://localhost:${process.env.PORT}/travel/traviscistatus`,
            json: true
          });
        })
        .then(body => {
          expect(body).to.be.an('object');
        });
    });
  });
});