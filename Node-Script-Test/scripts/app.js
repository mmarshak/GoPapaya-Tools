/*jslint node: true */

"use strict";

var Parse = require('parse/node');

const util = require('util');
const log    = require("debug")("appTest");
const error  = require("debug")("appTest:error");

// https://parse.com/tutorials/todo-app-with-javascript
// 

//Parse.initialize("9BIlUqHdTRs0GEHCADM0OcODVcHzKr0OcqDzGOBW");

// Initialize Parse with your Parse application javascript keys - when connection to www.parse.com
//  Parse.initialize("your-application-id",
//                   "your-javascript-key");


Parse.initialize("2wlLD2heOTJngATM5tu7w8EVmWdTA7TYTE1Ek6eE",
                   "fGCDyU5YTyV3sDcNx10MXAXKuRAVzEhwpFoGE8y3");

// When connecting to Parse server
//Parse.initialize("YOUR_APP_ID");
//Parse.serverURL = 'http://YOUR_PARSE_SERVER:1337/parse'


//***** Objects in - http://parseplatform.github.io/docs/js/guide/ ****/

// A complex subclass of Parse.Object
var Monster = Parse.Object.extend("Monster", {
  
  // Instance methods
  hasSuperHumanStrength: function () {
    return this.get("strength") > 18;
  },

  // Instance properties go in an initialize method
  initialize: function (attrs, options) {
    this.sound = "Rawr";
  }

}, {
  // Class methods
  spawn: function(strength) {
    var monster = new Monster();
    monster.set("strength", strength);
    return monster;
  }
});

var monster = Monster.spawn(200);
log(monster.get('strength'));  // Displays 200.
log(monster.hasSuperHumanStrength());
log(monster.sound);

class NewMonster extends Parse.Object {
	constructor() {
		 // Pass the ClassName to the Parse.Object constructor
    	super('Monster');
    	// All other initialization
    	this.sound = 'Rawr';
	}

	hasSuperHumanStrength(){
		return this.get('strength') > 18;
	}

	static spawn(strength){
		var monster = new Monster();
		monster.set('strength', strength);
		return monster;
	}
}

var newMonster = NewMonster.spawn(100);
log("newMonster strength = " + newMonster.get("strength"));
log("newMonster hasSuperHumanStrength =  " + newMonster.hasSuperHumanStrength());

log("**********************");

var GameScore = Parse.Object.extend("GameScore");
var gameScore = new GameScore();

gameScore.set("score", 1337);
gameScore.set("playerName", "Sean Plott");
gameScore.set("cheatMide", false);


var saveCompleted = false;

var save1 = gameScore.save(null,{

	success : function(gameScore) {
		log('1. New object created with objectId: %s', gameScore.id);
		saveCompleted = true;
	},
	error   : function(object, error) {
		log('1. Failed to create new object, with error code = %d meesage = %s ', error.code, error.message);
	}
});


// Add a check for timeout

var timeAllowed = 5000; // miliseconds

var failure = new Promise((resolve, reject) => {
	setTimeout(function(){
		reject(new Parse.Error(1001, "Network timeout"));
		//log("Got a timeout was called");

		if (!saveCompleted) {
			error("Got a timeout");
		}

	}, timeAllowed);
});

Promise.race([save1, failure])
	.then((obj)=> {
		log("Promise.race fulfulled " + util.inspect(obj));
	}) 
	.catch((err)=> {
	
		if (err && (err instanceof Parse.Error) && err.code == 1001){
			log("The Promise.race was rejected due to timeout " + util.inspect(err));
		}
		else {
			log("The Promise.race was rejected due to other error" + util.inspect(err));
		}

		error("Promise.race got an error " + util.inspect(err));

	});




///////


gameScore = new GameScore();

gameScore.set("score", 9999	);
gameScore.set("playerName", "Joe Smith");
gameScore.set("cheatMide", true);



// check that with Parse Promises the catch(err) also work, tested and it works :)

gameScore.save()
	.then(obj => {log('3. New object created with objectId: %s', obj.id);})
	.catch((err)=> {error("3. got an error " + util.inspect(err));});


// Test query

var query = new Parse.Query(GameScore);

query.get("svZ3FUAYJI",{

	success : function(gameScore) {
		log("Got result for object id %s, with conetnt of %s", gameScore.id, util.inspect(gameScore));
		log("The score is = %d", gameScore.get("score"));
		log(gameScore.id);
		log(gameScore.updatedAt);
		log(gameScore.createdAt);


		try {
			var now = Date.now();  // Time in msec since 1970

			var age = now - gameScore.createdAt.getTime();

			log("The Score object was created %s seconds ago", age / 1000);
		}
		catch(err){
			error("Got excpetion " + err);
		}


		gameScore.increment("score");
		gameScore.save();

	},
	error   : function(object, err) {
		//log("foo");
		error("Got an error from server %s", util.inspect(err));
	}

});


// Test reading a restaurant object and looping all over his attributes

var Restaurant = Parse.Object.extend("Restaurant");

// After specifying the Monster subclass...
//Parse.Object.registerSubclass('Restaurant', Restaurant);

query = new Parse.Query(Restaurant);

query.get("oFTBFcB02o",{

	success : function(restaurantObject) {
		log("Got result for Restaurant object id %s, with conetnt of %s", restaurantObject.id, util.inspect(restaurantObject));
		
		var keys = Object.keys(restaurantObject);

		log("All keys " + keys);
		log("typeof restaurantObject.attributes is = %s ", typeof restaurantObject.attributes);
		//log("All restaurantObject attributes " +  util.inspect(restaurantObject.attributes));

/*	-- This work , just comment it out to reduce logging

		for (var key in restaurantObject.attributes) {

			try {

				if (restaurantObject.get(key) instanceof Parse.File) {	
					log("key : Parse.File  %s : name = %s  url = %s", key, restaurantObject.get(key).name(), restaurantObject.get(key).url()  );
				}
				else if (restaurantObject.get(key) instanceof Parse.GeoPoint) {
					log("key : Parse.GeoPoint  %s : latitude = %s  longitude = %s", key, restaurantObject.get(key)._latitude, restaurantObject.get(key)._longitude  );
				}
				else {
					log("key : value  %s = %s", key, restaurantObject.get(key));
				}
			}
			catch(err){
				error("Got excpetion " + err);
			}

		}	
*/


	},
	error   : function(object, err) {
		//log("foo");
		error("Got an error from server reading restaurant %s", util.inspect(err));
	}

});


// Destroying Objects

gameScore.destroy();

gameScore = new GameScore();

gameScore.set("score", 2222	);
gameScore.set("playerName", "Joe Smith");
gameScore.set("cheatMide", true);


gameScore.save()
	.then((gameScore) => {
		log("Gamescore objectId was created %s", gameScore.id);
		gameScore.destroy();
	})
	.then((obj)=> {
		log("The Gamescore is now destroyed");
	})
	.catch((err) => {
		error("Got an error %s", util.inspect(err));
	});


// Relational Data
var Promotion = Parse.Object.extend("Promotion");


query = new Parse.Query(Promotion);

query.get("zjKBcsMSZ8")
	.then((promotionObject) => {
		log("Got result for Promotion object id %s, with conetnt of %s", promotionObject.id, util.inspect(promotionObject));

		var restaurntObjetId;

		for (var key in promotionObject.attributes) {

			try {

				if (promotionObject.get(key) instanceof Parse.File) {	
					log("key : Parse.File  %s : name = %s  url = %s", key, promotionObject.get(key).name(), promotionObject.get(key).url()  );
				}
				else if (promotionObject.get(key) instanceof Parse.GeoPoint) {
					log("key : Parse.GeoPoint  %s : latitude = %s  longitude = %s", key, promotionObject.get(key)._latitude, promotionObject.get(key)._longitude  );
				}
				else if (promotionObject.get(key) instanceof Restaurant){

					var restaurntObjet = promotionObject.get(key);
					restaurntObjetId = restaurntObjet.id;

					log("key : value  %s = %s , id = %s (Restaurant Object)", key, restaurntObjet, restaurntObjet.id ) ;
				}
				else {
					log("key : value  %s = %s", key, promotionObject.get(key));
				}
			}
			catch(err){
				error("Got excpetion " + err);
			}

		}


		var query2 = new Parse.Query(Restaurant);

		if (restaurntObjetId !== undefined) {

			var q1 = query2.get(restaurntObjetId);

			return Promise.all([q1, Promise.resolve(promotionObject)]);	

		}
		else {
			Promise.reject(new Parse.Error(1005, "Did not find restaurant object"));
		}

	})
	.then((args) => {

		var restaurntObjet2 = args[0], promotionObject2 = args[1];

		log("2. Got result for Promotion object id %s  Restaurant object id %s", util.inspect(promotionObject2), util.inspect(restaurntObjet2));
		
		var keys = Object.keys(restaurntObjet2);

		log("2. All keys " + keys);
		log("2. typeof restaurntObjet2.attributes is = %s ", typeof restaurntObjet2.attributes);
		//log("All restaurantObject attributes " +  util.inspect(restaurntObjet2.attributes));

		for (var key in restaurntObjet2.attributes) {

			try {

				if (restaurntObjet2.get(key) instanceof Parse.File) {	
					log("2. key : Parse.File  %s : name = %s  url = %s", key, restaurntObjet2.get(key).name(), restaurntObjet2.get(key).url()  );
				}
				else if (restaurntObjet2.get(key) instanceof Parse.GeoPoint) {
					log("2. key : Parse.GeoPoint  %s : latitude = %s  longitude = %s", key, restaurntObjet2.get(key)._latitude, restaurntObjet2.get(key)._longitude  );
				}
				else {
					log("2. key : value  %s = %s", key, restaurntObjet2.get(key));
				}
			}
			catch(err){
				error("2. Got excpetion " + err);
			}

		}	
	})
	.catch((err) => {
		error("2. Got an error from server reading promotion %s", util.inspect(err));
	});

//// ***** Test with MyClassName.createWithoutData

var newPromotion = Promotion.createWithoutData("zjKBcsMSZ8");

newPromotion.fetch()
	.then((object) => {
			log("******** promotion's restaurant object id %s", object.get("restaurant").id);
	})
	.catch((error) => {
			error("3. Got an error from server reading promotion %s", util.inspect(err));
	});






