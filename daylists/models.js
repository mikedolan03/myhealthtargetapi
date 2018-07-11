'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const foodSchema = new mongoose.Schema();

foodSchema.add({
  name: String,
  tags: String,
  time: {type: String, default: '12:00'}
});

const symptomSchema = new mongoose.Schema()
//enum for symptoms
symptomSchema.add({
  name: {type: String, required: true},
  severity: {type: Number, required: true},
  time: {type: String, default: '12:00'}
});

const DayListSchema = mongoose.Schema({
	user: {
	 	type: Schema.ObjectId,
	 	ref: 'User',
	  },
	date: {type: Date, default: Date.now}
	foodList: [foodSchema],
	symptomList: [symptomSchema]
});

//const dayLog 
// -user
// -date
// -foodList -fooditem - time
// -symptomlist



//this will give a food list in most recent order
//then we can slice and return a short list if we want

DayListSchema.virtual("getfoodList").get(function() {
const foodListObj = this.foodList.sort((a,b) => { 
 return b.date - a.date;
	});
	return foodListObj; 
});

DayListSchema.virtual("getsymptomList").get(function() {
const symptomListObj = this.symptomList.sort((a,b) => { 
 return b.date - a.date;
	});
	return symptomListObj; 
});

const DayList = mongoose.model("DayList", DayListSchema);

module.exports = { DayList };