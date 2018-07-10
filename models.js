'use strict';
const bcrypt = require('bcryptjs');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var foodSchema = new mongoose.Schema();

foodSchema.add({
  name: String,
  tags: String,
  date: {type: Date,  default: Date.now}
});

var symptomSchema = new mongoose.Schema()

symptomSchema.add({
  name: String,
  severity: Number,
  date: {type: Date,  default: Date.now}
});

const userDataSchema = mongoose.Schema({
	username: {type: String, required: true},
	password: {type: String, required: true},
	firstName: {type: String, required: true},
	lastName: String,
	email: String,
	foodList: [foodSchema],
	symptomList: [symptomSchema]
});

userDataSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userDataSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

//this will give a food list in most recent order
//then we can slice and return a short list if we want

userDataSchema.virtual("getfoodList").get(function() {
const foodListObj = this.foodList.sort((a,b) => { 
 return b.date - a.date;
	});
	return foodListObj; 
});

userDataSchema.virtual("getsymptomList").get(function() {
const symptomListObj = this.symptomList.sort((a,b) => { 
 return b.date - a.date;
	});
	return symptomListObj; 
});

const UserData = mongoose.model("UserData", userDataSchema);

module.exports = { UserData };