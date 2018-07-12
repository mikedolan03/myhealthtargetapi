'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const {DayList} = require('./models');
const router = express.Router();
const jsonParser = bodyParser.json();

//this is not a production end point
//but usefull to check state of the day list collection
router.get('/all', (req, res) => {
	return DayList.find()
	 .then(lists => res.json(lists))
	 .catch(err => res.status(500).json({message: 'Internal server error in get'}));
});

//lots of things the get can do depending on what the query is
router.get('/', (req, res) => {
	console.log('q= ', req.query);

		//this get can handle different requests
		//if date param is set - return the day list for that date
		//if sdate and edate are set - return the lists in the range
		//if symptom is set it will return days where symptom present
		//and if sym and dates - give only btwn date range
		//same for food 
		//finally it can return when foods and symptoms were present in a range
		//if none return all the users files

		//to do - search tags - date range option
		//tags + symptoms + range
		//should be able to find matches with ->
		//{foodList: {$elemMatch: {tags: { '$regex': 'gluten', '$options': 'i' }}}} 

//find a day list doc by day list id
if(req.query.id != null) {

			return DayList.findOne({
				$and:[
				{user: req.user.id}, 
				{_id: req.query.id} 
				]})
		 .then(list => res.json(list))
		 .catch(err => {
		 	res.status(500).json({message: 'Internal server error in get'})
		 });
		} else {
//find a day list based on a food id
		if(req.query.foodid != null) {

			return DayList.findOne({
				$and:[
				{user: req.user.id}, 
				{foodList: {$elemMatch: {_id: req.query.foodid}}} 
				]})
		 .then(list => res.json(list))
		 .catch(err => {
		 	res.status(500).json({message: 'Internal server error in get'})
		 });
		} else {
//find day list by a symptom id
			if(req.query.symptomid != null) {

			return DayList.findOne({
				$and:[
				{user: req.user.id}, 
				{symptomList: {$elemMatch: {_id: req.query.symptomid}}} 
				]})
		 .then(list => res.json(list))
		 .catch(err => {
		 	res.status(500).json({message: 'Internal server error in get'})
		 });
		} else {

//search based on a food tag - get all days where tag is present
	if(req.query.tag != null) {
			let startdate = "1/1/1980";
			let enddate = "1/1/3000";

			if(req.query.sdate != null) {
				startdate = req.query.sdate;
				enddate = req.query.edate;
			}

			return DayList.find({
				$and:[
				{user: req.user.id}, 
				{date: {$lte:enddate}}, 
				{date:{$gte:startdate}},
				{foodList: {$elemMatch: {tags: { '$regex': req.query.tag, '$options': 'i' }}}} 
				]})
		 .then(lists => res.json(lists))
		 .catch(err => {
		 	res.status(500).json({message: 'Internal server error in get'})
		 });
		} else {
//if symptom and food are passed - get all records where both 
//were had on same day - date range optional
		if(req.query.symptom != null && req.query.food != null) {
			let startdate = "1/1/1980";
			let enddate = "1/1/3000";

			if(req.query.sdate != null) {
				startdate = req.query.sdate;
				enddate = req.query.edate;
			}

			return DayList.find({
				$and:[
				{user: req.user.id}, 
				{date: {$lte:enddate}}, 
				{date:{$gte:startdate}},
				{symptomList: {$elemMatch: {name: req.query.symptom}}},
				{foodList: {$elemMatch: {name: req.query.food}}} 
				]})
		 .then(lists => res.json(lists))
		 .catch(err => {
		 	res.status(500).json({message: 'Internal server error in get'})
		 });
		} else {

		//if symptom is passed - get all records where it occurs 
		//- date range optional
		if(req.query.symptom != null) {
			let startdate = "1/1/1980";
			let enddate = "1/1/3000";

			if(req.query.sdate != null) {
				startdate = req.query.sdate;
				enddate = req.query.edate;
			}

			return DayList.find({
				$and:[
				{user: req.user.id}, 
				{date: {$lte:enddate}}, 
				{date:{$gte:startdate}},
				{symptomList: {$elemMatch: {name: req.query.symptom}}} 
				]})
		 .then(lists => res.json(lists))
		 .catch(err => {
		 	res.status(500).json({message: 'Internal server error in get'})
		 });
		} else {

		//if food is passed - get all records where its eaten 
		//- date range optional
		if(req.query.food != null) {
			let startdate = "1/1/1900";
			let enddate = "1/1/3000";

			if(req.query.sdate != null) {
				startdate = req.query.sdate;
				enddate = req.query.edate;
			}

			return DayList.find({
				$and:[
				{user: req.user.id}, 
				{date: {$lte:enddate}}, 
				{date:{$gte:startdate}},
				{foodList: {$elemMatch: {name: req.query.food}}} 
				]})
		 .then(lists => res.json(lists))
		 .catch(err => {
		 	res.status(500).json({message: 'Internal server error in get'})
		 });
		} else { 
		
		//if specific date is passed -get day list from that day
		if(req.query.date != null) {

			return DayList.findOne({
				user: req.user.id,
				date: req.query.date 
			})
		 .then(lists => res.json(lists))
		 .catch(err => {
		 	res.status(500).json({message: 'Internal server error in get'})
		 });

		} else { 

		//if date range is passed -get day lists between dates

			 if(req.query.sdate != null && req.query.edate != null) {
			 		//return lists with a range
			 	return DayList.find({$and:[{user: req.user.id}, {date: {$lte:req.query.edate}}, {date:{$gte:req.query.sdate}} ]})
			 	 .then(lists=> res.json(lists))
			 	 .catch(err => {
				 	 res.status(500).json({message: 'Internal server error in get'})
				  });
			 } else 
				 { 

		//if no query is passed -get all lists for user

				 return DayList.find({user: req.user.id})
				  .then(lists => res.json(lists))
				  .catch(err => {
				 	 res.status(500).json({message: 'Internal server error in get'})
				  });
				 }
				}
			 }
			}
	   }
	  }
	}
}
}
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

//this post needs to be fixed - remove the dummy data and replace
//with data that is getting passed 
//---using post because list creation and updating will be done from
// the same form without the user consiously creating/adding
//everything just looks like loggin the data to them

//post options:
//- user is trying to add item to day list but doesnt exist - 
//   create a list()
//- creation will have a food and symptom check since 
//   one will be submitted during creation
//- user is adding symptom to day list thats already here - add it
//- user is adding food to day list - add it
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