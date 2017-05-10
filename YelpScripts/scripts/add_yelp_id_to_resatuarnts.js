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

var Parse = require('parse/node');

const yelp = require('yelp-fusion');

// Token was generated on April 28, 2017, and is good till October 27, 2017
let yelpToken = "hdBAKMg4_rMuKtnC3JoOTC7IvYsx30l5Aehq2Ax4KTAJKEcwnEMnn8Oo6PheIr0Qqwafuqz0bLbTN4maLQgeISrxk37tux0VCcgS5Xf7V37YoCTtqezQQ9WDSGwDWXYx";

const client = yelp.client(yelpToken);


// // http://stackoverflow.com/questions/17124053/node-js-get-image-from-web-and-encode-with-base64
// In case we bring binary data make sure that request does not do any encoding otherwise parse have an issue with the raw image saved
// Explantion why it is required -
// From https://github.com/request/request
// encoding - Encoding to be used on setEncoding of response data. If null, the body is returned as a Buffer. Anything else (including the default value of undefined) 
// will be passed as the encoding parameter to toString() (meaning this is effectively utf8 by default). 
// (Note: if you expect binary data, you should set encoding: null.)


var requestImage = require('request').defaults({ encoding: null });

var Jimp = require("jimp");


// By default debug will log to stderr, however this can be configured per-namespace by overriding the log method:


const log       = misc_util.createLogger("yelp:add-yelp-id" );
const logError  = misc_util.createLogger("yelp:add-yelp-di:error");


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


const AppConstants        = require("./app-constants");

var Restaurant = Parse.Object.extend(AppConstants.KParseRestaurantClass);


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

if (process.env.ACTIVE_RUN !== "0" && process.env.ACTIVE_RUN !== "1"  ) {
	logError("ACTIVE_RUN is not valid, it should be set to 0 or 1");
	return;
}

if (process.env.RATING_UPDATE !== "0" && process.env.RATING_UPDATE !== "1"  ) {
	logError("RATING_UPDATE is not valid, it should be set to 0 or 1");
	return;
}

let updateYelpRating;

if (process.env.RATING_UPDATE === "1") {
	updateYelpRating = true;
}
else {
	updateYelpRating = false;
}



log("process.env.PRODUCTION_DB				= %s"   , process.env.PRODUCTION_DB === "1" ? "Production" 			: "Test_Android_App");
log("process.env.ACTIVE_RUN					= %s %s", process.env.ACTIVE_RUN    === "1" ? "Active Run" 			: "Test Run");
log("process.env.RATING_UPDATE				= %s %s", process.env.RATING_UPDATE === "1" ? "Update Yelp Rating" 	: "Skip updating Yelp Rating");

log("only one restaurant - argv[2])			= %s %s" ,process.argv[2], typeof process.argv[2] );

prompt.get([{
		description: 'Does this look right? (Y/n)',
		name        : "answer"
	}], function (err, result) {
		    if (err) { return onErr(err); }
		    console.log('Command-line input received:');
		    console.log('  answer: ' + result.answer);

		    if (result.answer !== "Y" && result.answer !== "n") {
		    	onErr("Illegal answer, only allowed answers are Y or n");
		    }

		    if (result.answer === "Y") {
			    log("#### Now excute .... updateYelpRating = %s", updateYelpRating);
			    setParseConnection();
			    // Read promotions from disk and schedule one if needed
				add_yelp_id_to_resatuarants(updateYelpRating);
					

			}
			else {
				log("#### Aborting ....");
			}
  });

 function onErr(err) {
    console.log(err);
   process.exit(1);
 }

return;




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


function add_yelp_id_to_resatuarants(updateYelpRating) {

	var promise = new Promise((resolve, reject) => {


		// Try to find the reward object of the person that own the invide code
		var restaurantQuery =  new Parse.Query(AppConstants.KParseRestaurantClass);

		//restaurantQuery.equalTo("objectId", "VfU1ZwYltx");


		// The query can return up to 1000 objects, there is a way to deal with it, but at the time we going to query for all users
		// we have less then 1000 users with email address, so this is not a problem
		restaurantQuery.limit(1000);

		let stats = {addedRestaurants : 0 , skippedRestaurants : 0};

		restaurantQuery.find({useMasterKey: true })
			.then((restaurants) => {

				if (!restaurants) {
					log("add_yelp_id_to_resatuarants did not find any restaurants");
					resolve("No restaurants founds to add gray scale image");
					return;
				}


				let restaurantsArray = [];

				// Check if we got a single object or an array
				if (Array.isArray(restaurants)){
					log("add_yelp_id_to_resatuarants we found %s restaurants", restaurants.length);
					restaurantsArray = restaurants;
				}
				else {
					log("add_yelp_id_to_resatuarants we 1 restaurant with id = %s", restaurants.id);
					restaurantsArray.push(restaurants);
				}

				// We excute the addition of the rewards in sequence in order not to load the server
				// http://stackoverflow.com/questions/20100245/how-can-i-execute-array-of-promises-in-sequential-order	

				restaurantsArray.reduce(function(curr, next) {
					    return curr.then(function() {

					    	log("Processing restaurant.id = %s", next.id);

					    	// Do some basic chekc about the restaurant object
					    	if (!isRestaurantDataValid(next)) {
					    		logError("Restaurant object is invalid %s", util.inspect(next));
					    		return Promise.reject("restauarnt object is invalid " + next.id);
					    	}

					    	let restaurantName = next.get(AppConstants.KParseRestaurantNameKey);

					    	// Skip Test restaurant
					    	if (next.get(AppConstants.KParseRestaurantTestKey)) {
					    		log("Restaurant %s is a test restuarnt, skipping", restaurantName);

								++stats.skippedRestaurants;

					    		return Promise.resolve("restauarnt object is invalid " + restaurantName);
					    	}

					    	// Test fake Apple restaurant
					    	if (restaurantName === "Apple Grill") {
								log("Restaurant %s is a Appke fake restaurant, skipping", restaurantName);


								++stats.skippedRestaurants;

					    		return Promise.resolve("restauarnt object is invalid " + restaurantName);
					    	}



					    	// Check if we allreayd have a yelp ID, if we were not asked to update the yelp rating we skip the restaurant

					    	let currentYelpID = next.get(AppConstants.KParseRestaurantYelpBusinessIdKey);

					    	if (!updateYelpRating && currentYelpID && currentYelpID.length > 0) {

								logError("Restaurant id %s already have a yelp business id %s, skipping", next.id, currentYelpID);
								
								++stats.skippedRestaurants;

					    		return Promise.resolve("Skipping");
					    	}

					    	// Build the yelp search object
					    	let yelpSearchObject = getYelpSearchObject(next);

					    	if (!yelpSearchObject) {
					    		logError("yelpSearchObject build failed for restaurant object %s", util.inspect(next));
					    		return Promise.reject("restauarnt object is invalid " + next.id);
					    	}



					    	// next is the current restaurant
					    	return client.search(yelpSearchObject)
					    		.then((response) => {

									if (!response || !response.jsonBody || !response.jsonBody || response.jsonBody.total === undefined) {
										logError("Missing Yelp response for restaurant %s and yelpSearchObject %s", util.inspect(next), util.inspect(yelpSearchObject));
										return Promise.reject("Fail to get response from yelp for search object " + util.inspect(yelpSearchObject));
									}

									if (response.jsonBody.businesses === undefined) {
										logError("Missing Yelp business in yelp response for restaurant %s and yelpSearchObject %s", util.inspect(next), util.inspect(yelpSearchObject));
										return Promise.reject("Fail to find business in yelp response from yelp for search object " + util.inspect(yelpSearchObject));
									}

					    			// Check if this a valid response
					    			let yelpBusiness = response.jsonBody.businesses[0];

					    			// Check that the yelp business is valid
					    			if (!isYelpBusinessValid(next.id, yelpBusiness)) {
					    				logError("Yelp business invalid in yelp response for restaurant %s and yelpSearchObject %s", util.inspect(next), util.inspect(response));
										return Promise.reject("Yelp business invalid in yelp response from yelp for search object " + util.inspect(response));
					    			}

					    			// Check if the restaurant object match the yelp business
					    			if (!isYelpBusinessMatchRestaurant(next, yelpBusiness )) {
					    				logError("Yelp business does not match restaurant object yelp business  \n %s\n and yelpSearchObject %s", util.inspect(next), util.inspect(response));
										return Promise.reject("Yelp business invalid in yelp response from yelp for search object " + util.inspect(response));
					    			}
									
					    			log("Restaurant %s had yelp id %s with rating %s", restaurantName, yelpBusiness.id, yelpBusiness.rating);

					    			// If this is not an active run we skip updating the restaurant object
					    			if (process.env.ACTIVE_RUN !== "1") {
					    				return Promise.resolve("All set for restaurant %s", next.id);
					    			}	

					    			// Add the yelp business id 
					    			next.set(AppConstants.KParseRestaurantYelpBusinessIdKey, yelpBusiness.id);

					    			let currentYelpRating = next.get(AppConstants.KParseRestaurantYelpRatingKey);

					    			if (currentYelpRating === undefined || updateYelpRating) {
										next.set(AppConstants.KParseRestaurantYelpRatingKey, yelpBusiness.rating);
					    			}

					    			return next.save(null, { useMasterKey: true });

					    		})
					    		
								.then((restaurantObj) => {

									log("restuarnt %s Yelp info  was saved id %s ", restaurantName, next.id);

									++stats.addedRestaurants;
								})
								
					    		.catch((err) => {

					    			logError("add_yelp_it_to_restaurant got an error reading restaurants , err = %s", util.inspect(err));

									return Promise.reject("add_yelp_it_to_restaurant got error " + util.inspect(err));

					    		});
					        
					    });
					}, Promise.resolve())
					.then(() => {
						log("add_yelp_it_to_restaurant - All Done , stats = %s", util.inspect(stats) );
						resolve("Processed "+ restaurantsArray.length + " users . stats = " + util.inspect(stats) );
						return;
					})
					.catch((err) => {
						logError("add_yelp_it_to_restaurant -  (2) Got error %s stack =\n%s", util.inspect(err, {showHidden: false, depth: null}), err.stack);	
						reject("add_yelp_it_to_restaurant - Got error " + util.inspect(err, {showHidden: false, depth: null}));	
						return;
					});

			})
			.catch((err) => {
				logError("add_yelp_it_to_restaurant got an error (3) , err = %s stack = %s", util.inspect(err), err.stack);
				reject("add_yelp_it_to_restaurant got an error  , err = " +  util.inspect(err));
				return;

			});

	});



	promise
		.then((result) => {
			logError("add_yelp_id_to_resatuarants All done ");
			return;
		})
		.catch((err) => {
			logError("add_yelp_id_to_resatuarants got an error reading images (1) , err = %s stack = %s", util.inspect(err), err.stack);
			return;
		});

	
}

// Build an object to use with Yelp Search
function getYelpSearchObject(restaurantObject) {

	if (!isRestaurantDataValid(restaurantObject)) {
		logError("getYelpSearchObject restaurant Object invalid %s", util.inspect(restaurantObject));
		return null;
	}

	const restaurantName 	= restaurantObject.get(AppConstants.KParseRestaurantNameKey);
	const restaurantAddress = restaurantObject.get(AppConstants.KParseRestaurantAddressAKey);
	const restaurantCity 	= restaurantObject.get(AppConstants.KParseRestaurantCityKey);
	const restaurantState 	= restaurantObject.get(AppConstants.KParseRestaurantStateKey);

	const restaurantLocation 	= restaurantObject.get(AppConstants.KParseRestaurantLocationKey);


	let fullAddress = restaurantAddress + " " + restaurantCity + " , " + restaurantState ;


	let yelpSearchObject = {
		term 	 	: restaurantName, 
		location 	: fullAddress    ,
		latitude 	: restaurantLocation.latitude,
		longitude 	: restaurantLocation.longitude,
		radius      : 300,
		limit    : 1 
	};


	return yelpSearchObject;


}


// Check if a yelp business result match our restaurant info
function isYelpBusinessMatchRestaurant(restaurantObject, yelpBusiness ) {

	if (!isRestaurantDataValid(restaurantObject)) {
		logError("isYelpBusinessMatchRestaurant restaurant Object invalid %s", util.inspect(restaurantObject));
		return null;
	}

	const restaurantName 		= _.clone(restaurantObject.get(AppConstants.KParseRestaurantNameKey));
	const restaurantAddress 	= _.clone(restaurantObject.get(AppConstants.KParseRestaurantAddressAKey));
	const restaurantCity 		= _.clone(restaurantObject.get(AppConstants.KParseRestaurantCityKey));
	const restaurantState 		= _.clone(restaurantObject.get(AppConstants.KParseRestaurantStateKey));

	const restaurantNameNoSpaces 		= restaurantName.toLowerCase().replace(/\s/g,'');	
	const restaurantAddressNoSpaces 	= restaurantAddress.toLowerCase().replace(/\s/g,'');	
	const restaurantCityNoSpaces 		= restaurantCity.toLowerCase().replace(/\s/g,'');	
	const restaurantStateNoSpaces 		= restaurantState.toLowerCase().replace(/\s/g,'');	


	// Check the yelp business object

	if (!isYelpBusinessValid(restaurantObject.id, yelpBusiness)) {
		logError("isYelpBusinessMatchRestaurant yelp is invalid for restaurant Object invalid %s , yelp obkect %s", util.inspect(restaurantObject), util.inspect(yelpBusiness));
		return null;
	}

	const yelpRestaurantName 		= yelpBusiness.name;
	const yelpRestaurantAddress 	= yelpBusiness.location.address1;
	const yelpRestaurantCity 		= yelpBusiness.location.city;
	const yelprestaurantState 		= yelpBusiness.location.state;


	let yelpRestaurantNameNoSpaces  	= yelpBusiness.name.toLowerCase().replace(/\s/g,'');
	let yelpRestaurantAddressNoSpaces  	= yelpBusiness.location.address1.toLowerCase().replace(/\s/g,'');
	let yelpRestaurantCityNoSpaces  	= yelpBusiness.location.city.toLowerCase().replace(/\s/g,'');
	let yelprestaurantStateNoSpaces  	= yelpBusiness.location.state.toLowerCase().replace(/\s/g,'');



	const yelpID                  = yelpBusiness.id;
	const yelpRating              = yelpBusiness.rating;


	// Make sure we point to the same business	


	// Check the restaurant name

	let maxLenghtToCheck = Math.min(restaurantNameNoSpaces.length, 5);

	if (yelpRestaurantNameNoSpaces.length < maxLenghtToCheck) {
		logError("isYelpBusinessMatchRestaurant restaurant %s , mismatch with yelp restaurant name , name too short %s", restaurantName, yelpRestaurantName );
		return false;
	}

	let sub1 = restaurantNameNoSpaces.substring(0, maxLenghtToCheck - 1);
	let sub2 = yelpRestaurantNameNoSpaces.substring(0, maxLenghtToCheck - 1);

	if (sub1 !== sub2) {
		logError("isYelpBusinessMatchRestaurant restaurant %s , mismatch with yelp restaurant name , name not matching %s", restaurantName, yelpRestaurantName );
		return false;
	}

	// Check the restaurant address

	maxLenghtToCheck = Math.min(restaurantAddressNoSpaces.length, 5);

	if (yelpRestaurantAddressNoSpaces.length < maxLenghtToCheck) {
		logError("isYelpBusinessMatchRestaurant restaurant %s,  our address %s , mismatch with yelp restaurant address , address too short %s", 
			restaurantName, restaurantAddress, yelpRestaurantAddress );
		return false;
	}

	sub1 = restaurantAddressNoSpaces.substring(0, maxLenghtToCheck - 1);
	sub2 = yelpRestaurantAddressNoSpaces.substring(0, maxLenghtToCheck - 1);

	if (sub1 !== sub2) {
		logError("isYelpBusinessMatchRestaurant restaurant name %s, our address %s , mismatch with yelp restaurant address, address not matching %s", 
			restaurantName, restaurantAddress, yelpRestaurantAddress );
		return false;
	}

	// Check the restaurant city

	maxLenghtToCheck = Math.min(restaurantCityNoSpaces.length, 5);

	if (yelpRestaurantCityNoSpaces.length < maxLenghtToCheck) {
		logError("isYelpBusinessMatchRestaurant restaurant %s,  our city %s , mismatch with yelp restaurant city , city too short %s", 
			restaurantName, restaurantCity, yelpRestaurantCity );
		return false;
	}

	sub1 = restaurantCityNoSpaces.substring(0, maxLenghtToCheck - 1);
	sub2 = yelpRestaurantCityNoSpaces.substring(0, maxLenghtToCheck - 1);

	if (sub1 !== sub2) {
		logError("isYelpBusinessMatchRestaurant restaurant name %s, our city %s , mismatch with yelp restaurant city, city not matching %s", 
			restaurantName, restaurantCity, yelpRestaurantCity );
		return false;
	}

	// Check the restaurant state

	maxLenghtToCheck = Math.min(restaurantStateNoSpaces.length, 5);

	if (yelprestaurantStateNoSpaces.length < maxLenghtToCheck) {
		logError("isYelpBusinessMatchRestaurant restaurant %s,  our state = %s , mismatch with yelp restaurant state , state too short %s", 
			restaurantName, restaurantState, yelprestaurantState );
		return false;
	}

	sub1 = restaurantStateNoSpaces.substring(0, maxLenghtToCheck - 1);
	sub2 = yelprestaurantStateNoSpaces.substring(0, maxLenghtToCheck - 1);

	if (sub1 !== sub2) {
		logError("isYelpBusinessMatchRestaurant restaurant name %s, our state = %s , mismatch with yelp restaurant state, state not matching %s", 
			restaurantName, restaurantState, yelprestaurantState );
		return false;
	}


	return true;


}


// Some Basic sanity check about the restaurant object
function isRestaurantDataValid(restaurantObject) {

	if (!restaurantObject) {
		logError("getYelpSearchObject missing restaurant Object");
		return false;
	}

	const restaurantName 	= restaurantObject.get(AppConstants.KParseRestaurantNameKey);
	const restaurantAddress = restaurantObject.get(AppConstants.KParseRestaurantAddressAKey);
	const restaurantCity 	= restaurantObject.get(AppConstants.KParseRestaurantCityKey);
	const restaurantState 	= restaurantObject.get(AppConstants.KParseRestaurantStateKey);
	const restaurantLocation 	= restaurantObject.get(AppConstants.KParseRestaurantLocationKey);




	if (!restaurantName || restaurantName.length === 0){
		logError("isRestaurantDataValid missing restaurant name for restaurant object %s", restaurantObject.id);
		return false;
	}

	if (!restaurantAddress || restaurantAddress.length === 0){
		logError("isRestaurantDataValid missing restaurant address for restaurant object %s", restaurantObject.id);
		return false;
	}

	if (!restaurantCity || restaurantCity.length === 0){
		logError("isRestaurantDataValid missing restaurant city for restaurant object %s", restaurantObject.id);
		return false;
	}

	if (!restaurantState || restaurantState.length === 0){
		logError("isRestaurantDataValid missing restaurant state for restaurant object %s", restaurantObject.id);
		return false;
	}

	if (!restaurantLocation) {
		logError("isRestaurantDataValid missing restaurant location for restaurant object %s", restaurantObject.id);
		return false;
	}


	return true;


}

// Some Basic sanity check about the yelp object
function isYelpBusinessValid(restaurantObjectID, yelpBusiness) {

	if (!yelpBusiness) {
		logError("isYelpBusinessMatchRestaurant missing yelp object for restaurant Object invalid %s", restaurantObjectID);
		return null;
	}

	let yelpRestaurantName 		= yelpBusiness.name;
	let yelpRestaurantAddress 	= yelpBusiness.location.address1;
	let yelpRestaurantCity 		= yelpBusiness.location.city;
	let yelprestaurantState 	= yelpBusiness.location.state;

	let yelpID                  = yelpBusiness.id;
	let yelpRating              = yelpBusiness.rating;


	if (!yelpRestaurantName || yelpRestaurantName.length === 0){
		logError("isYelpBusinessValid Yelp object missing restaurant name for restaurant object %s yelp business = %s ", restaurantObjectID, util.inspect(yelpBusiness));
		return false;
	}

	if (!yelpRestaurantAddress || yelpRestaurantAddress.length === 0){
		logError("isYelpBusinessValid Yelp object missing restaurant address for restaurant object %s yelp business = %s ", restaurantObjectID, util.inspect(yelpBusiness));
		return false;
	}

	if (!yelpRestaurantCity || yelpRestaurantCity.length === 0){
		logError("isYelpBusinessValid Yelp object missing restaurant city for restaurant object %s yelp business = %s ", restaurantObjectID, util.inspect(yelpBusiness));
		return false;
	}

	if (!yelprestaurantState || yelprestaurantState.length === 0){
		logError("isYelpBusinessValid Yelp object missing restaurant state for restaurant object %s yelp business = %s ", restaurantObjectID, util.inspect(yelpBusiness));
		return false;
	}

	if (!yelpID || yelpID.length === 0){
		logError("isYelpBusinessValid Yelp object missing restaurant yelp id for restaurant object %s yelp business = %s ", restaurantObjectID, util.inspect(yelpBusiness));
		return false;
	}

	if (yelpRating === undefined){
		logError("isYelpBusinessValid Yelp object missing restaurant yelp rating for restaurant object %s yelp business = %s ", restaurantObjectID, util.inspect(yelpBusiness));
		return false;
	}

	if (Number.isNaN(yelpRating)){
		logError("isYelpBusinessValid Yelp object missing restaurant yelp rating for restaurant object %s yelp business = %s ", restaurantObjectID, util.inspect(yelpBusiness));
		return false;
	}

	return true;

}










