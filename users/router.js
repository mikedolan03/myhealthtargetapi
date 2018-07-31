'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const {User} = require('./models');
const router = express.Router();
const jsonParser = bodyParser.json();

//register a new user
//accepts json data like 
//{"username": "test", "password": "passwordpassword","firstName": "Joe", "lastName": "Smith", "email": "test@test.com"}
router.post('/', jsonParser, (req, res) => {
 const requiredFields = ['username', 'password'];
 const missingField = requiredFields.find(field => !(field in req.body));
//check all the fields are there
 if(missingField) {
  return res.status(422).json({
  	code: 422,
  	reason: 'ValidationError',
  	message: 'Missing field',
  	location: missingField
  });
 }

 const stringFields = ['username', 'password', 'firstName', 'lastName', 'email'];
 const nonStringField = stringFields.find(field => field in req.body && typeof req.body[field] !== 'string');

//check that all the fields are strings
if(nonStringField) { 
 return res.status(422).json({
  code: 422,
  	reason: 'ValidationError',
  	message: 'incorrect field type - expect a string',
  	location: nonStringField
 });
}

//trimming logic here
let {username, password, firstName, lastName, email} = req.body;

//check is the username is taken already
return User.find({username})
 .count()
 .then(count => {
 	if(count > 0) {
 		//already a user with that name
 		return Promise.reject({
 		  code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'	
 		});
 	}
 	return User.hashPassword(password);
 })
 .then(hash => {
 	return User.create({
     username,
     password: hash,
     firstName,
     lastName,
     email
 	});
 })
 .then(user => {
 	return res.status(201).json(user.serialize());
 })
  .catch(err => {
 	if (err.reason === "ValidationError") {
 		return res.status(err.code).json(err);
 	}
 	res.status(500).json({code: 500, message: 'Internal server error :('});
 });
});


router.get('/', (req, res) => {
	return User.find()
	 .then(users => res.json(users.map(user=> user.serialize())))
	 .catch(err => res.status(500).json({message: 'Internal server error in get'}));
});
/*
router.delete('/:id', (req, res) => {

  User
    .findByIdAndRemove(req.params.id)
    .then( user => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error in delete'}));
 });

 */

module.exports = {router};