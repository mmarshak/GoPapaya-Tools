/*jslint node: true */

"use strict";

var Parse = require('parse/node');

const util = require('util');
const log    = require("debug")("appTest");
const logError  = require("debug")("appTest:error");

const parse_cache_fs = require("./parse-cache-fs");

// // http://stackoverflow.com/questions/17124053/node-js-get-image-from-web-and-encode-with-base64
// In case we bring binary data make sure that request does not do any encoding otherwise parse have an issue with the raw image saved
// Explantion why it is required -
// From https://github.com/request/request
// encoding - Encoding to be used on setEncoding of response data. If null, the body is returned as a Buffer. Anything else (including the default value of undefined) 
// will be passed as the encoding parameter to toString() (meaning this is effectively utf8 by default). 
// (Note: if you expect binary data, you should set encoding: null.)

var requestImage = require('request').defaults({ encoding: null });


// TEST APP KEYS 
const TEST_APP_KEY         = "2wlLD2heOTJngATM5tu7w8EVmWdTA7TYTE1Ek6eE";
const TEST_JAVA_SCRIPT_KEY = "fGCDyU5YTyV3sDcNx10MXAXKuRAVzEhwpFoGE8y3";
const TEST_MASTER_KEY      = "fwnz4nF4pCr6DgoQl6Xj8hiPcwF3exeKWWOxcip6";



// PRODUCTION APP 
const APP_KEY         = "l7F9xkTQrSxhf0RuXVlZ7MpC1rM96aeQrN8D3lGd";
const JAVA_SCRIPT_KEY = "ntZoSdTpNLU2hRbRqF5gaYYpnGiTFGVHejHvDsEN";
const MASTER_KEY      = "VuOyNjUL4o4w02o9iif8KP9GzWtyIJwhRYFFtWjG";


// https://parse.com/tutorials/todo-app-with-javascript
// 

//Parse.initialize("9BIlUqHdTRs0GEHCADM0OcODVcHzKr0OcqDzGOBW");

// Initialize Parse with your Parse application javascript keys - when connection to www.parse.com
//  Parse.initialize("your-application-id",
//                   "your-javascript-key");


// WARNING - YOU USE MASTER KEY - BE CAREFUL!!!!!!!

// To connect to Parse.com
//Parse.initialize("2wlLD2heOTJngATM5tu7w8EVmWdTA7TYTE1Ek6eE",
//                   "fGCDyU5YTyV3sDcNx10MXAXKuRAVzEhwpFoGE8y3");

// When connecting to Parse server
//Parse.initialize("2wlLD2heOTJngATM5tu7w8EVmWdTA7TYTE1Ek6eE");
//Parse.serverURL = 'https://ce62b29d.ngrok.io/pserver'


var GameScore = Parse.Object.extend("GameScore");
var query = new Parse.Query(GameScore);
query.lessThan("score", 600);
query.find({
  success: function(results) {
    log("Successfully retrieved " + results.length + " scores.");
    // Do something with the returned Parse.Object values
    for (var i = 0; i < results.length; i++) {
      var object = results[i];
      log(object.id + ' - ' + object.get('playerName'));
    }
  },
  error: function(error) {
    logError("Error: " + error.code + " " + error.message);
  }
});


query = new Parse.Query(GameScore);
query.lessThan("score", 600);
query.first({
  success: function(result) {
    log("Successfully retrieved a score.");
    log(result.id + ' - ' + result.get('playerName'));
   
  },
  error: function(error) {
    logError("Error: " + error.code + " " + error.message);
  }
});


/* Relational query */
var Restaurant = Parse.Object.extend("Restaurant");
var Promotion  = Parse.Object.extend("Promotion");

var promotion = Promotion.createWithoutData("zjKBcsMSZ8");
var restaurant = Restaurant.createWithoutData("VfU1ZwYltx");


//var promotion = Promotion.createWithoutData("zjKBcsMggggSZ8");
//var restaurant = Restaurant.createWithoutData("VfU1ZwYltx");


query = new Parse.Query(Promotion);

query.equalTo("objectId", promotion.id);
query.equalTo("restaurant", restaurant);
// query.include("restaurant");

// Note - unlike in Android and iOS if there are zero match, this is not an error, instead we get an array of length 0
query.find()
	.then((results) => {

		log("Got %s results for promotion query", results.length);
		 for (var i = 0; i < results.length; i++) {
     		 var object = results[i];
      		log("Promotion id %s , restuarnt id %s and its attributes", object.id, object.get("restaurant").id,  util.inspect( object.get("restaurant").attributes) );
    	}

	})
	.catch((err) => {
		logError("Got an error %s", util.inspect(err));
	});

/****************/
/* Uer object   */
/*
try {

	Parse.User.logIn("mm@mm.com", "1112", {
	  success: function(user) {
	    // Do stuff after successful login.
	    log("**** User login succesfulty %s attributes = %s", util.inspect(user), util.inspect(user.attributes));
	    log("**** User login succesfulty %s attributes = %s", util.inspect(user), util.inspect(user.attributes));
	  },
	  error: function(result, err) {
	    // The login failed. Check error to see why.
	    logError("*** Got an error !!!!!!");
	    logError('**** Failed to login, with error code = %d meesage = %s ', err.code, err.message);  }
	});
}
catch(err){
	logError("2. Got excpetion " + err);		
}
*/



