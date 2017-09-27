'use strict';

const chai = require('chai');
const expect = require('chai').expect;

chai.use(require('chai-as-promised'));

describe('model/mongo-repo', function() {
  
  beforeEach(function() {
    this.mongoConnect = require('./../../../lib/model/mongo-connector')({
      url: 'mongodb://localhost:27017'
    });
    this.collection = 'test-collection';
    
    this.repo = require('./../../../lib/model/mongo-repo')({
      connect: this.mongoConnect,
      collection: this.collection
    });
  });
  
  afterEach(function() {
    return this.mongoConnect()
      .then(db => db.collection(this.collection))
      .then(col => col.deleteMany());
  });
  
  it('test', function() {
    
  });
  
  describe('#findOneById', function() {
    
    context('when the record exists', function() {
      
      beforeEach(function() {
        this.id = '123';
        this.doc = {
          _id: this.id,
          john: 'doe'
        };
        return this.mongoConnect()
          .then(db => db.collection(this.collection))
          .then(col => col.insertOne(this.doc));
      });
      
      it('resolve to the record', function() {
        const p = this.repo.findOneById(this.id);
        return expect(p).to.eventually.deep.equal(this.doc);
      });
    });
    
    context('when the record does not exist', function() {
      
      it('resolves to null', function() {
        const someNonExistingId = 'notExisting';
        const p = this.repo.findOneById(someNonExistingId);
        return expect(p).to.eventually.equal(null);
      });
    });
    
  });
  
  describe('#update', function() {
    
    context('when the record exists', function() {
      
      it('updates the record', function() {
        this.doc = {
          _id: 123,
          john: 'doe'
        };
        const p = this.repo.update(this.doc);
        return p.then(record => {
          expect(record).to.have.property('_id', this.doc._id);
          expect(record).to.have.property('john', this.doc.john);
        });
      });
    });
    
    context('when the record does not exist', function() {
      
      it('inserts the record', function() {
        this.doc = {
          john: 'doe'
        };
        const p = this.repo.update(this.doc);
        return p.then(record => {
          expect(record).to.have.property('john', this.doc.john);
          expect(record).to.have.property('_id');
        });
      });
      
      it('inserts the record initially and updates it on subsequent calls', function() {
        this.doc = {
          john: 'doe'
        };
        const p = this.repo.update(this.doc);
        return p.then(record => {
          return Promise.all([p, this.repo.update(record)]);
        }).then(values => {
          const insertRecord = values[0];
          const updateRecord = values[1];
          expect(insertRecord).to.deep.equal(updateRecord);
        });
      });
    });
    
  });
});