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

router.delete('/', (req, res) => {
	 DayList
  	.deleteOne({
  		user: req.user.id, _id: req.body.id
  	})    
    .then(cur_daylist => res.status(200).json("deleted") )
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });

	});

router.post("/", (req, res) => {
//check is the day log exists 
DayList.findOne({
 user: req.user.id, date: req.body.date
 }, function(err, foundList) { 
 console.log('found:', foundList);
  if(foundList == null) {
  	console.log('didnt find it');
  	 
 	 	console.log('no day list exists - lets make one');

 	let newList = DayList.create({
    	user: req.user.id,
    	date: req.body.date,
    	foodList: [ 
    		{name: 'cheese', tags: 'green, legume', time: '12:00'},
    		{name: 'coffee', tags: 'vegetable, chips', time: '12:00'},
    		{name: 'nuts', tags: 'candy, salty, fermented', time: '12:00'}
     	],
    	symptomList: [
    		{name: 'Gas', severity: '5', time: '12:00' },
    		{name: 'Pain', severity: '2', time: '12:00' }
    	]
  	});
 	
 	newList.then(function (createdList) {
  		res.send(createdList);
	})
 		
 
 		//no list found- create new one with added stuff

 	 } else {
 	 	 	console.log('this day list already exists');

 	 	 	foundList.foodList.unshift(...req.body.fooditems);

    	foundList.save(function (err, foundList) {
        if (err) return res.status(400).json({message: 'Could not save bucketlist in db'});
        res.send(foundList);
    	});

 	 		//one found so add to it
 	 }

 });
});

//ADD FOOD END POINT
//this end points adds foods to users food list 
/* takes an object like this in the req.body
{"fooditems": [
{"name": "chilis", "tags": "red, vegetable, pepper", "date": "7/3/2018"}, 
{"name": "oranges", "tags": "fruit, peel, citris", "date": "7/6/2018"}
]}

*/

//this will figure out if the user is adding a food or a symptom and put it 
//in a day log

router.put("/", (req, res) => {

	//step 1 - is there a list doc for this user for this day already
	//step 2 - if not, create one, if so, use it
	//step 3 - check req for foodlist or symptom list
	//step 4 - update list 

	console.log('body: ', req.body);

	if( ('foodList' in req.body) ) {
			console.log('we have a food!'); 
	}

	 DayList
  	.findOne({
  		user: req.user.id, date: req.body.date
  	})    
    .then(cur_daylist => { 
    	cur_daylist.foodList.unshift(...req.body.fooditems);
    	cur_daylist.save();
    	res.send(cur_daylist.foodList);
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    }); 

});


module.exports = {router};