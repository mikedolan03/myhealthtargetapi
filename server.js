'use strict';

const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

//const PORT = process.env.PORT || 3000;
const {PORT, DATABASE_URL} = require("./config");
const { UserData } = require('./models');

const app = express();
app.use(express.json());

app.get("/api/user", (req, res) => {
  UserData.find()
    // we're limiting because restaurants db has > 25,000
    // documents, and that's too much to process/return
    .limit(10)
    // success callback: for each restaurant we got back, we'll
    // call the `.serialize` instance method we've created in
    // models.js in order to only expose the data we want the API return.    
    .then(users => {
      res.json({
        users: users.map(user => user.foodList)
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

app.post("/api/user", (req, res) => {
  //const requiredFields = ["name", "borough", "cuisine"];
  /*for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  } */

  UserData.create({
    userName: 'test',
    password: 'password',
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
