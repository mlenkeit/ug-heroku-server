'use strict';

const chai = require('chai');
const expect = require('chai').expect;
const request = require('supertest');
const sinon = require('sinon');

chai.use(require('sinon-chai'));

describe('app', function() {
  
  beforeEach(function() {
    this.travelRepo = {
      findOneById: sinon.stub(),
      update: sinon.stub()
    };
    
    this.app = require('./../../lib/app')({
      travelRepo: this.travelRepo
    });
    
    this.reqParam = {};
  });
  
  describe('/travel', function() {
    
    beforeEach(function() {
      this.reqParam.name = 'someTravelDestination';
      this.travelDestination = {
        name: this.reqParam.name,
        destination: 'http://localhost:6666',
        type: 'redirect'
      };
    });
    
    describe('GET /:name', function() {
      
      context('when :name is configured for redirect', function() {
        
        beforeEach(function() {
          this.travelRepo.findOneById
            .withArgs(this.reqParam.name)
            .resolves(this.travelDestination);
        });
        
        it('responds with 302 and sends a redirect to the destination url', function(done) {
          request(this.app)
            .get(`/travel/${this.reqParam.name}`)
            .expect(302)
            .expect('Location', this.travelDestination.destination)
            .end(done);
        });
      });
      
      context('when :name does not exist', function() {
        
        beforeEach(function() {
          this.travelRepo.findOneById
            .withArgs(this.reqParam.name)
            .resolves(null);
        });
        
        it('responds with 404', function(done) {
          request(this.app)
            .get(`/travel/${this.reqParam.name}`)
            .expect(404)
            .expect('Content-Type', /json/)
            .end(done);
        });
      });
      
      context('when travelRepo fails', function() {
        
        beforeEach(function() {
          this.travelRepo.findOneById.rejects();
        });
        
        it('responds with 500', function(done) {
          request(this.app)
            .get(`/travel/${this.reqParam.name}`)
            .expect(500)
            .expect('Content-Type', /json/)
            .end(done);
        });
      });
    });
    
    describe('PUT /:name', function() {
      
      beforeEach(function() {
        this.reqParam.name = 'someTravelDestination';
      });
      
      context('when called with valid travel destination', function() {
        
        beforeEach(function() {
          this.travelRepo.update
            .withArgs(sinon.match.has('_id', this.travelDestination.name))
            .resolves(this.travelDestination);
        });
        
        it('responds with 204 and stores the travel destination', function(done) {
          request(this.app)
            .put(`/travel/${this.reqParam.name}`)
            .send(this.travelDestination)
            .expect(204)
            .expect(() => {
              expect(this.travelRepo.update)
                .to.be.calledWith(sinon.match(this.travelDestination));
            })
            .end(done);
        });
        
        it('responds with 400 when :name is inconsitent with payload', function(done) {
          request(this.app)
            .put(`/travel/${this.reqParam.name}-invalid`)
            .send(this.travelDestination)
            .expect(400)
            .end(done);
        });
      });
      
      context('when called with invalid travel destination', function() {
        
        beforeEach(function() {
          this.travelRepo.update
            .withArgs(sinon.match.has('_id', this.travelDestination.name))
            .resolves(null);
        });
        
        it('responds with 400', function(done) {
          request(this.app)
            .put(`/travel/${this.reqParam.name}`)
            .send(this.travelDestination)
            .expect(400)
            .end(done);
        });
      });
      
      context('when travelRepo fails', function() {
        
        beforeEach(function() {
          this.travelRepo.update.rejects();
        });
        
        it('responds with 500', function(done) {
          request(this.app)
            .put(`/travel/${this.reqParam.name}`)
            .send(this.travelDestination)
            .expect(500)
            .expect('Content-Type', /json/)
            .end(done);
        });
      });
    });
  });
  
});