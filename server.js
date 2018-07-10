'use strict';
const moment = require('moment');

const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

//const PORT = process.env.PORT || 3000;
const {PORT, DATABASE_URL} = require("./config");
const { UserData } = require('./models');

const app = express();
app.use(express.json());

//this get returns user info and all list items for user
app.get("/api/user", (req, res) => {
  UserData.findOne({'username': 'bob2000'})    
    .then(user => {
      res.json({
      		user: {
      			username: user.username,
      			firstName: user.firstName
      		},
        	foodlist: user.foodList,
        	symptomlist: user.symptomList
        })
      })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

//GET FOOD WITHIN DATE RANGE END POINT
//end point to allow user to submit a time frame to get foods
//so we can get foods that were eaten prior to a symptom

//takes enddate and startdate headers

app.get("/api/foodsWithinDates", (req, res) => {
	console.log('req', req); 
  UserData
  	.findOne({
  		username: req.headers.username
  	})    
    .then(user => {

    	console.log('req endDate:',req.headers.enddate); 

			let endday = new Date(req.headers.enddate).getTime();

      let startday = new Date(req.headers.startdate).getTime();
  
  let newFoodList = user.foodList.filter(f => {
  	let time = new Date(f.date).getTime();
                             return (startday < time && time < endday);
                            });
	console.log(newFoodList);

			 
      res.json({
        	foodlist: newFoodList
        })
      })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

//GET Symptom WITHIN DATE RANGE END POINT
//end point to allow user to submit a time frame to get symptoms
//so we can get symptoms that occured after a certain food

//takes enddate and startdate headers

app.get("/api/symptomsWithinDates", (req, res) => {
	console.log('req', req); 
  UserData
  	.findOne({
  		username: req.headers.username
  	})    
    .then(user => {

    	console.log('req endDate:',req.headers.enddate); 

			let endday = new Date(req.headers.enddate).getTime();

      let startday = new Date(req.headers.startdate).getTime();
  
  let newSymptomList = user.symptomList.filter(f => {
  	let time = new Date(f.date).getTime();
                             return (startday < time && time < endday);
                            });
	console.log(newSymptomList);

			 
      res.json({
        	symptomlist: newSymptomList
        })
      })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
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
app.put("/api/addtofoodlist", (req, res) => {

	console.log('body: ', req.body);

	 UserData
  	.findOne({
  		username: req.headers.username
  	})    
    .then(user => { 
    	user.foodList.unshift(...req.body.fooditems);
    	user.save();
    	res.send(user.foodList);
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    }); 

});

//ADD SYMPTOM END POINT
/* takes an object like this in the req.body
{"symptoms": [
{"name": "gas", "severity": "4", "date": "7/3/2018"}, 
{"name": "pain", "severity": "6", "date": "7/6/2018"}
]}

*/
app.put("/api/addtosymptomlist", (req, res) => {

	console.log('body: ', req.body);

	 UserData
  	.findOne({
  		username: req.headers.username
  	})    
    .then(user => { 
    	user.symptomList.unshift(...req.body.symptoms);
    	user.save();
    	res.send(user.symptomList);
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    }); 

});

//this is a dummy user creation endpoint 
//needs to actually take user input 
//currently just makes the same user each time
app.post("/api/nuser", (req, res) => {
  //const requiredFields = ["name", "password", "firstname"];
  /*for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  } */

  UserData.create({
    username: 'test2',
    password: 'passwordpassword',
    firstName: 'Joe',
    lastName: 'Smith',
    email: 'test@test.com',
    foodList: [ 
    					{name: 'cheerios', tags: 'grain, milk', date: '7/8/2018'},
    					{name: 'cheese', tags: 'dairy, milk', date: '7/7/2018'},
    					{name: 'pickles', tags: 'cucumber, salty, fermented', date: '7/5/2018'}
     ],
    symptomList: [
    							{name: 'Sick Stomach', severity: '5', date: '7/7/2018' },
    							{name: 'Headach', severity: '2', date: '7/8/2018' }
    						]
  })
    .then(userdata => res.status(201).json(userdata) )
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});


// Post to register a new user
app.post('/api/user', jsonParser, (req, res) => {
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
  	console.log('missing something req -',req.body);
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const stringFields = ['username', 'password', 'firstName', 'lastName', 'email'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  // If the username and password aren't trimmed we give an error.  Users might
  // expect that these will work without trimming (i.e. they want the password
  // "foobar ", including the space at the end).  We need to reject such values
  // explicitly so the users know what's happening, rather than silently
  // trimming them and expecting the user to understand.
  // We'll silently trim the other fields, because they aren't credentials used
  // to log in, so it's less of a problem.
  const explicityTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 10,
      // bcrypt truncates after 72 characters, so let's not give the illusion
      // of security by storing extra (unused) info
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let {username, password, firstName = '', lastName = '', email} = req.body;
  // Username and password come in pre-trimmed, otherwise we throw an error
  // before this
  firstName = firstName.trim();
  lastName = lastName.trim();

  console.log('in trim', firstName);

  return UserData.find({username})
    .count()
    .then(count => {
    	  console.log('in count', username);

      if (count > 0) {
        // There is an existing user with the same username
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      // If there is no existing user, hash the password
      return UserData.hashPassword(password);
    })
    .then(hash => {
    	    	  console.log('in hash', hash);

      return UserData.create({    
		    username,
		    password: hash,
		    firstName,
		    lastName,
		    email
      });
    })
    .then(userdata => {
    	console.log('after create', username);
      return res.status(201).json(userdata);
    })
    .catch(err => {
      // Forward validation errors on to the client, otherwise give a 500
      // error because something unexpected has happened
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      //console.log('err', user);
      console.log('req -',req.body);
      console.log('err: ', err);

      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});


let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      databaseUrl,
      err => {
        if (err) {
          return reject(err);
        }
        server = app
          .listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve();
          })
          .on("error", err => {
            mongoose.disconnect();
            reject(err);
          });
      }
    );
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log("Closing server");
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
