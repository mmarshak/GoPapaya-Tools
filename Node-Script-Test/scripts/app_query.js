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



// https://parse.com/tutorials/todo-app-with-javascript
// 

//Parse.initialize("9BIlUqHdTRs0GEHCADM0OcODVcHzKr0OcqDzGOBW");

// Initialize Parse with your Parse application javascript keys - when connection to www.parse.com
//  Parse.initialize("your-application-id",
//                   "your-javascript-key");


// To connect to Parse.com
Parse.initialize("2wlLD2heOTJngATM5tu7w8EVmWdTA7TYTE1Ek6eE",
                   "fGCDyU5YTyV3sDcNx10MXAXKuRAVzEhwpFoGE8y3");

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

var GameScore = Parse.Object.extend("GameScore");


Parse.User.logIn("mm@mm.com", "1111")
	.then((user) => {

		log("**** User login succesfulty %s session token = %s", util.inspect(user), user._sessionToken);
	//	log("**** User login succesfulty %s attributes = %s", util.inspect(user), util.inspect(user.attributes));

		// Does not work in node.js enviroment - will return null all the time
		/*var currentUser = Parse.User.current();
		if (currentUser) {
		    log("1. currentUser =  %s ", util.inspect(currentUser));
		} else {
		    logError("1. No currentUser");
		}
		*/

		/* ACL */

		var gameScore = new GameScore();

		gameScore.set("score", 1234);
		gameScore.set("playerName", "David Koff");
		gameScore.set("cheatMide", false);

		var postACL = new Parse.ACL(user);
		postACL.setPublicReadAccess(true);
		//postACL.setPublicReadAccess(true);
		gameScore.setACL(postACL);
		gameScore.save();


	})

	.catch((err) => {
		// The login failed. Check error to see why.
	    logError("*** Got an error !!!!!!");
	    logError('**** Failed to login, with error code = %d meesage = %s ', err.code, err.message);  
	});



/* Manage files */

query = new Parse.Query(Restaurant);

// Dok Bua restaurant
var restaurant = Restaurant.createWithoutData("oFTBFcB02o");


restaurant.fetch()
	.then((restaurantObj) => {
//		log("*** restuarnt id %s, photo url = %s and its attributes", restaurantObj.id,  restaurantObj.get("photo").url(), util.inspect( restaurantObj.attributes) );
		log("*** 1. restuarnt id %s ", restaurantObj.id);
		// Get the File content
		return new Promise((resolve, reject) => {

			requestImage(restaurantObj.get("photo").url(), function (error, response, body) {
			  if (!error && response.statusCode == 200) {
			    log("*** 1. Got the photo of size %s", body.length); // Show the HTML for the Google homepage. 
			    
				resolve(Promise.all([Promise.resolve(restaurantObj), Promise.resolve(body)]));	

			  }
			  else {
			  	logError("Failed to get the photo");
			  	reject(error);
			  }
			});

		});


	} )
	.then((args) => {
		let restaurantObj = args[0];
		let fileData 	  = args[1];


		log("*** 2. restuarnt id %s ", restaurantObj.id);

		// http://stackoverflow.com/questions/33725285/cloud-code-creating-a-parse-file-from-url
		// http://stackoverflow.com/questions/17124053/node-js-get-image-from-web-and-encode-with-base64
		// Both options (data, data1) works
		var data = {
			base64 : new Buffer(fileData).toString('base64')
		};

		var data1 = {
			base64 : fileData.toString('base64')
		};


//		var file = new Parse.File("myfile.jpg", data, "image/png");
		var file = new Parse.File("myfile.jpg", data1 );
		return Promise.all([Promise.resolve(restaurantObj), file.save() ]);

	})
	.then((args) => {
		let restaurantObj = args[0];
		let parseFile 	  = args[1];


		log("*** 3. restuarnt id %s ", restaurantObj.id);


		restaurantObj.set("photo100", parseFile);

		return restaurantObj.save();

	})
	.then((restaurantObj) => {
		log("*** 4. restuarnt was saved id %s ", restaurantObj.id);
	})
	.catch((err) => {
		// The login failed. Check error to see why.
		if (err instanceof Parse.Error){
		    logError('**** Got an error reading restaurant, with error code = %d meesage = %s ', err.code, err.message);  
		}
		else {
			  logError('**** Got an error reading restaurant, with error %s ', util.inspect(err));  
		}
	});


// GeoPoint 
var point = new Parse.GeoPoint({latitude: 42.307654, longitude:-71.186143});

query = new Parse.Query(Restaurant);
query.withinMiles("location", point, 2.0);
query.limit(10);

query.find()
	.then((results) => {

		log("GeoPoint :: Got %s results for promotion query", results.length);
		 for (var i = 0; i < results.length; i++) {
     		 var object = results[i];
      		log("GeoPoint :: Restaurant id %s , restuarnt id %s and its attributes", object.id, object.get("name"));
    	}

	})
	.catch((err) => {
		logError("GeoPoint :: Got an error %s", util.inspect(err));
	});


// Send Push -- both works
/*
Parse.Push.send({
  channels: [ "GuestcAwFf8MpiC", "Mets" ],
  data: {
    alert: "The Giants won against the Mets 2-3."
  }
}, {
  success: function() {
    // Push was successful
    log("Push 1 :: successful");
  },
  error: function(error) {
    logError("Push 1 :: Got an error %s", util.inspect(error));
  }
});



var point2 = new Parse.GeoPoint({latitude: 40.307654, longitude:-71.186143});

var query = new Parse.Query(Parse.Installation);
query.greaterThanOrEqualTo('GoPapayaInternalVer', 1);
query.withinMiles("location", point, 2.0);


Parse.Push.send({
  where: query, // Set our Installation query
  data: {
    alert: "Willie Hayes injured by own pop fly."
  }
}, {
  success: function(obj) {
    // Push was successful
     log("Push 2 :: successful %s", util.inspect(obj));
  },
  error: function(error) {
    // Handle error
    logError("Push 2 :: Got an error %s", util.inspect(error));
  }
});

*/

/* Works
Parse.Config.get()
	.then((config) => {
		log("Parse Config :: %s", util.inspect(config) );

		return parse_cache_fs.save("config", config);

	})
	.then((object) => {
		log("Parse Config :: was saved in FS");
	})
	.catch((err) => {
		logError("Parse Config :: Got an error %s", util.inspect(err));
	});

*/


parse_cache_fs.read("config")
	.then((cachedObject) => {

		var config = cachedObject.object;
		var age    = Date.now() - cachedObject.timeStamp;

		log("Parse Config from cache:: age = %s sec", age/1000);
		//log("Parse Config from cache:: age = %s sec, %s", age/1000, util.inspect(config) );
		
	})
	.catch((err) => {
		logError("Parse FS Config :: Got an error %s", util.inspect(err));

	});



parse_cache_fs.keylist()
	.then((keylist) => {
		log("+++++++ keylist =  %s", util.inspect(keylist) );


	})
	.catch((err) => {
		logError("+++++ keylist :: Got an error %s", util.inspect(err));

	});

// 




