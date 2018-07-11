'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const {DayList} = require('./models');
const router = express.Router();
const jsonParser = bodyParser.json();


router.get('/', (req, res) => {
	return DayList.find()
	 .then(lists => res.json(lists))
	 .catch(err => res.status(500).json({message: 'Internal server error in get'}));
});


module.exports = {router};