/*jslint node: true */

"use strict";

var Parse = require('parse/node');

const util = require('util');

//const moment    	= require("moment");
const   moment 		= require('moment-timezone');
const moment_range  = require("moment-range");

const misc_util		= require('./misc-utils');

const _ = require("lodash");

var prompt = require('prompt');

const AppConstants        = require("./app-constants");

var Promotion    = Parse.Object.extend(AppConstants.KParsePromotionClass);
var Restaurant   = Parse.Object.extend(AppConstants.KParseRestaurantClass);

// By default debug will log to stderr, however this can be configured per-namespace by overriding the log method:

const log       = misc_util.createLogger("yelp:remove-promotions" );
const logError  = misc_util.createLogger("yelp:remove-promotions:error");

const APP_KEY         = "l7F9xkTQrSxhf0RuXVlZ7MpC1rM96aeQrN8D3lGd";
const JAVA_SCRIPT_KEY = "ntZoSdTpNLU2hRbRqF5gaYYpnGiTFGVHejHvDsEN";
const MASTER_KEY      = "VuOyNjUL4o4w02o9iif8KP9GzWtyIJwhRYFFtWjG";


// Android Test App DB
const TEST_APP_KEY         = "2wlLD2heOTJngATM5tu7w8EVmWdTA7TYTE1Ek6eE";
const TEST_JAVA_SCRIPT_KEY = "fGCDyU5YTyV3sDcNx10MXAXKuRAVzEhwpFoGE8y3";
const TEST_MASTER_KEY      = "fwnz4nF4pCr6DgoQl6Xj8hiPcwF3exeKWWOxcip6";


// set this namespace to log via console.log
//log.log = console.log.bind(console); // don't forget to bind to console!
//logError.log = console.log.bind(console); // don't forget to bind to console!

// Define the default time zone
moment.tz.setDefault("America/New_York");
//moment.tz.setDefault("America/Los_Angeles");


prompt.start();

if (process.env.PRODUCTION_DB === undefined ) {
	logError("PRODUCTION_DB is not defined, it should be set to 1 (use production DB) or 0 (use Test_Android_App DB)");
	return;
}

if (process.env.PRODUCTION_DB !== "0" && process.env.PRODUCTION_DB !== "1"  ) {
	logError("PRODUCTION_DB is not valid, it should be set to  1 (use production DB) or 0 (use Test_Android_App DB)");
	return;
}

/*
if (process.env.ACTIVE_RUN !== "0" && process.env.ACTIVE_RUN !== "1"  ) {
	logError("ACTIVE_RUN is not valid, it should be set to 0 or 1");
	return;
}
*/

let restaurantID = process.argv[2];

if (!restaurantID) {
	logError("restaurantID to remove is missigs argv[2]");
	return;
}

// Check the restaurant id

if (typeof restaurantID === 'string' || restaurantID instanceof String) {
			
	if (restaurantID.length === 0) {
		logError("Invalid restaurantID %s ", restaurantID);
		return;
	}
}
else {
	logError("Invalid restaurantID %s (not a string)", restaurantID);
	return;
}

// Check the start date
let startSearchDateMoment = moment(process.argv[3], "MM/DD/YYYY");

if (!startSearchDateMoment.isValid()) {
	logError("Validation error - startDate argv[3] is in wrong format need to be MM/DD/YYYY , argv[3] = %s", util.inspect(process.argv[3], {showHidden: false, depth: null}));
	return null;
}

// Check optional end date
let endSearchDateMoment = null;

if (process.argv[4]) {

	endSearchDateMoment = moment(process.argv[4], "MM/DD/YYYY");

	if (!endSearchDateMoment.isValid()) {
		logError("Validation error - endDate argv[4] is in wrong format need to be MM/DD/YYYY , argv[4] = %s", util.inspect(process.argv[4], {showHidden: false, depth: null}));
		return null;
	}

	if (endSearchDateMoment.isBefore(startSearchDateMoment)) {
		logError("Validation error - endDate %s is before startDate %s", util.inspect(endSearchDateMoment.toDate()), util.inspect(startSearchDateMoment.toDate())  );
		return null;
	}	
}


log("PRODUCTION_DB\t\t= %s"   , process.env.PRODUCTION_DB === "1" ? "Production" 			: "Test_Android_App");
//log("ACTIVE_RUN\t\t= %s %s", process.env.ACTIVE_RUN    === "1" ? "Active Run" 			: "Test Run");

log("restaurantID\t\t= %s %s" ,restaurantID, typeof process.argv[2] );
log("startDate\t\t= %s %s" ,startSearchDateMoment ? startSearchDateMoment.toDate() : "missing", typeof process.argv[3] );
log("endDate\t\t= %s %s\n" ,endSearchDateMoment   ? endSearchDateMoment.toDate() 	 : "missing", typeof process.argv[4] );


// Set the Parse connection
setParseConnection();

// Find the restaurant object
var restaurantQuery = new Parse.Query(Restaurant);

restaurantQuery.equalTo("objectId", restaurantID);

var restaurantQueryPromise = restaurantQuery.first({useMasterKey : true});


// Find the promotion for the time period we are looking at
// Get all the promotions in relavnt time period of the new promotions

var promotionQuery = new Parse.Query(Promotion);

var restaurantObjectWithoutData = Restaurant.createWithoutData(restaurantID);

promotionQuery.equalTo(AppConstants.KParsePromotionRestaurantKey, restaurantObjectWithoutData);

promotionQuery.greaterThanOrEqualTo(AppConstants.KParsePromotionStartTimeKey, startSearchDateMoment.toDate());

if (endSearchDateMoment) {
	promotionQuery.lessThanOrEqualTo(AppConstants.KParsePromotionStartTimeKey, endSearchDateMoment.toDate());
}

promotionQuery.addAscending(AppConstants.KParsePromotionStartTimeKey);

promotionQuery.limit(1000);

var promotionQueryPromise = promotionQuery.find({useMasterKey : true});

 Promise.all([ restaurantQueryPromise, promotionQueryPromise] )
	.then((args) => {

		var restaurantObject = args[0];
		var promotionObjects = args[1];

		if (!restaurantObject) {
			logError("We did not find restaurant Object for restaurant id %s", restaurantID);
			return;
		}

		let restaurantName = restaurantObject.get(AppConstants.KParseRestaurantNameKey);
		let city 		   = restaurantObject.get(AppConstants.KParseRestaurantCityKey);

		log("restaurantName\t\t= %s" ,restaurantName);
		log("city\t\t\t= %s\n" ,city );


		if (!promotionObjects) {
			logError("We did not find promotion object for restaurant id %s name %s for the dates specified ", restaurantID);
			return;
		}

		if (promotionObjects.length === 0) {
			logError("We did not find promotion object for restaurant id %s name %s for the dates specified ", restaurantID);
			return;
		}

		let promotionsToDestory = [];

		let startSearchDateInMesc = startSearchDateMoment.valueOf();

		for (let promotionObject of promotionObjects) {

			let startTime = promotionObject.get(AppConstants.KParsePromotionStartTimeKey).valueOf();  // in msec
		
			if (startTime < startSearchDateInMesc) {
				logError("Found promotion %s with start time before our search cretira - Error", promotionObject.id);
				return;
			}

			if (endSearchDateMoment) {

				let endSearchDateInMesc = endSearchDateMoment.valueOf();

				if (startTime > endSearchDateInMesc) {
					logError("Found promotion %s with start time after our search cretira - Error", promotionObject.id);
					return;
				}
			}

			promotionsToDestory.push(promotionObject);

		}

		if (promotionsToDestory.length === 0) {
			logError("Did not find any promotions to delete");
			return;
		}

		log("Found %s promotions to delete", promotionsToDestory.length);

		for (let promotionObject of promotionsToDestory) {
			log("Promotion id %s start date %s , end date %s", promotionObject.id, 
					promotionObject.get(AppConstants.KParsePromotionStartTimeKey).toString(), promotionObject.get(AppConstants.KParsePromotionEndTimeKey).toString() ); 
		}


		// Verify with the user that all look good

		prompt.get([{
				description: 'Does this look right? (Y/n)',
				name        : "answer"
			}], function (err, result) {
				if (err) { return onErr(err); }
				    log('Command-line input received:');
				    log('  answer: ' + result.answer);

				    if (result.answer !== "Y" && result.answer !== "n") {
				    	onErr("Illegal answer, only allowed answers are Y or n");
				    }

				    if (result.answer === "Y") {

						log("#### Now excute .... ");
					 
				        Parse.Object.destroyAll( promotionsToDestory ,{ useMasterKey: true })
				            .then((success) => {
				                log("Successfully deleted promotions");
				              })
				            .catch((error) => {

				            	log("error occured deleting objects");

								// An error occurred while deleting one or more of the objects.
						      	// If this is an aggregate error, then we can inspect each error
						      	// object individually to determine the reason why a particular
						      	// object was not deleted.
						      	if (error.code === Parse.Error.AGGREGATE_ERROR) {
						        	for (var i = 0; i < error.errors.length; i++) {
						          		log("Couldn't delete " + error.errors[i].object.id + "due to " + error.errors[i].message);
						        	}
						      	} 
						      	else {
						        	log("Delete aborted because of " + error.message);
						      	}

						      	return;

				            });

				}
				else {
					log("#### Aborting ....");
				}
		  });


	})
	.catch((err) => {
		logError(" got an error (3) , err = %s stack = %s", util.inspect(err), err.stack);
		return;

	});


function onErr(err) {
	log(err);
	process.exit(1);
}



function setParseConnection() {
	// When connecting to Parse server - this are the crenetail for the Android test DB App
	//Parse.initialize("2wlLD2heOTJngATM5tu7w8EVmWdTA7TYTE1Ek6eE");
	//Parse.serverURL = 'https://cf6b06b5.ngrok.io/pserver';

	if (process.env.PRODUCTION_DB === "1") {
		// Live Parse Server credentails
		Parse.initialize(APP_KEY, JAVA_SCRIPT_KEY, MASTER_KEY);
		//Parse.serverURL = 'https://www.mmparse.com/pserver';
		Parse.serverURL = "http://10.10.10.89:1337/pserver";
		//Parse.serverURL = 'http://127.0.0.1:1337/pserver';
	}
	else {
		// Test Parse Server credentails
		Parse.initialize(TEST_APP_KEY, TEST_JAVA_SCRIPT_KEY, TEST_MASTER_KEY);
		//Parse.serverURL = 'https://www.mmparse.com/pserver';
		Parse.serverURL = "http://10.10.10.89:1337/pserver";
		//Parse.serverURL = 'https://cf6b06b5.ngrok.io/pserver';
	}

}
