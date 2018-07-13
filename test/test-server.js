const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {DayList} = require('../daylists/models');
const {User} = require('../users/models');

const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

let authTok = '';

chai.use(chaiHttp);



describe('API Log in', function() {

	let newUser = {};

	before(function() {
 		return runServer(TEST_DATABASE_URL);
 	});

 	after(function() {
    	return closeServer();
    });

	it('should create a user account and return', function() {
		
			
		newUser.username = faker.internet.userAgent();	
		console.log("user name",newUser.username);
		newUser.password = faker.internet.password();
		newUser.firstName = faker.name.firstName();
		newUser.lastName = faker.name.lastName();
		newUser.email = faker.internet.email(); 

		return	chai.request(app)
		.post('/api/users/')
		.send(newUser)
		then(function(res) {
			expect(res.status).to.equal(201)
			expect(res.body).to.be.a('object');
			expect(res.body).to.have.all.keys('username','_id')
		})
	});


	it('should log in a user and return a token', function() {
		this.timeout(10000);
		let user = {};
		user.username = newUser.username;
		user.password = newUser.password;
			return chai.request(app)
			.post('/api/auth/login')
			.send(user)
			.then(function(res) {
				
				//expect(res).to.be.json;
				expect(res.body).to.be.a('object');
				expect(res.body).to.include.keys('authToken');
				authTok = res.body.authToken; 
				
			})
	});

	it('should not allow unauthorized access to api end points', function() {

			return chai.request(app)
			.post('/api/users')
			.then(function(res) {
				expect(res.status).to.equal(422)
				return chai.request(app)
				.get('/api/users')
					.then(function(res) {
						expect(res.status).to.equal(404)
						return chai.request(app)
						.get('/api/daylists/')
						.then(function(res) {
							expect(res.status).to.equal(401)
							return chai.request(app)
							.post('/api/daylists/')
							.then(function(res) {
								expect(res.status).to.equal(401)
								return chai.request(app)
							})
						})
					})
			})
		});

	describe('API Calls to get Day List info', function() {

	let newList = {	"date": "6/04/2018",
									"fooditems": [
										{"name": "bagel", "tags": "bread", "time": "8:00"}, 
										{"name": "waffle", "tags": "maple syrup", "time": "7:00"}
									]
								} 
	

	it('should create a new day list with food item in users day lists', function() {
			return chai.request(app)	
					.post('/api/daylists')
					.set('Authorization', ('BEARER '+ authTok))
					.send(newList)
					.then(function(res) { 
						console.log("res:", res.body)
						expect(res).to.have.status(200)
						expect(res.body).to.be.a('object')
						//expect(res.body).to.have.all.keys('places', '_id', 'user');
					})
		})

	let addtoList = {	"date": "6/04/2018",
									"fooditems": [
										{"name": "chips", "tags": "potato, fried", "time": "8:00"}, 
										{"name": "ketchup", "tags": "tomato, sugar", "time": "7:00"}
									]
								} 

	it('should add food items in a users day list', function() {
			return chai.request(app)	
					.post('/api/daylists')
					.set('Authorization', ('BEARER '+ authTok))
					.send(addtoList)
					.then(function(res) { 
						console.log("res:", res.body)
						expect(res).to.have.status(200)
						expect(res.body).to.be.a('object')
						//expect(res.body).to.have.all.keys('places', '_id', 'user');
					})
		})

	let addsymtoList = {	"date": "6/04/2018",
									"symptoms": [
										{"name": "pain", "severity": "5", "time": "8:00"}, 
										{"name": "headache", "severity": "3", "time": "7:00"}
									]
								} 

	it('should add symptoms in a users day list', function() {
			return chai.request(app)	
					.post('/api/daylists')
					.set('Authorization', ('BEARER '+ authTok))
					.send(addsymtoList)
					.then(function(res) { 
						console.log("res:", res.body)
						expect(res).to.have.status(200)
						expect(res.body).to.be.a('object')
						//expect(res.body).to.have.all.keys('places', '_id', 'user');
					})
		})

	it('should retrieve users day lists', function() {
			return chai.request(app)	
					.get('/api/daylists')
					.set('Authorization', ('BEARER '+ authTok))
					.then(function(res) { 
						console.log("res:", res.body)
						expect(res).to.have.status(200)
						expect(res.body).to.be.a('array')
						expect(res.body[0]).to.have.all.keys('user', '_id', 'date', 'foodList', 'symptomList', '__v');
					})
		})


	let anotherdayList = {	"date": "6/05/2018",
									"fooditems": [
										{"name": "bagel", "tags": "bread", "time": "8:00"}, 
										{"name": "waffle", "tags": "maple syrup", "time": "7:00"}
									]
								} 
	

	it('should create a new day list with food item in users day lists', function() {
			return chai.request(app)	
					.post('/api/daylists')
					.set('Authorization', ('BEARER '+ authTok))
					.send(anotherdayList)
					.then(function(res) { 
						console.log("res:", res.body)
						expect(res).to.have.status(200)
						expect(res.body).to.be.a('object')
						//expect(res.body).to.have.all.keys('places', '_id', 'user');
					})
		})


	it('should retrieve one specific day from users day lists', function() {
			return chai.request(app)
					.post('/api/daylists')
					.set('Authorization', ('BEARER '+ authTok))
					.send(anotherdayList)
					.then(function(res) { 
						return chai.request(app)
						.get('/api/daylists')
						.set('Authorization', ('BEARER '+ authTok))
						.query({ date: '6/4/2018' })
						.then(function(res) { 
							console.log("res:", res.body)
							console.log("warning may fail due to toISOString timezone")
							expect(res).to.have.status(200)
							expect(res.body).to.be.a('object')
							expect(res.body).to.have.all.keys('user', '_id', 'date', 'foodList', 'symptomList', '__v');
							expect(res.body.date).to.equal(new Date('6/4/2018').toISOString()); 
						})
					})
					
					
		})
	});
});