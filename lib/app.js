'use strict';

const bodyParser = require('body-parser');
const check = require('check-types');
const express = require('express');
const HttpError = require('./HttpError');
const winston = require('winston');

module.exports = function(config) {
  check.assert.object(config.travelRepo, 'config.travelRepo must be of type object');
  const travelRepo = config.travelRepo;
  
  const app = express();
  
  app.get('/travel/:name', (req, res, next) => {
    const name = req.params.name;
    travelRepo.findOneById(name)
      .then(record => {
        if (!record) {
          return next(new HttpError(404, 'Not found'));
        }
        
        res.redirect(302, record.destination);
      }).catch(next);
  });
  
  app.put('/travel/:name', bodyParser.json(), (req, res, next) => {
    const name = req.params.name;
    const record = req.body;
    
    if (name !== record.name) {
      return next(new HttpError(400, 'Invalid payload'));
    }
    
    record._id = record.name;
    travelRepo.update(record)
      .then(record => {
        if (!record) {
          return next(new HttpError(400, 'Invalid payload'));
        }
        res.status(204).send();
      }).catch(next);
  });
  
  
  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    winston.log('error', err);
    res.status(statusCode).json(err);
  });
  
  return app;
};