/*jslint node: true */

"use strict";

var Parse = require('parse/node');

const util = require('util');

//const moment    	= require("moment");
const   moment 		= require('moment-timezone');
const moment_range  = require("moment-range");


var prompt = require('prompt');

var Parse = require('parse/node');


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

const log    = require("debug")("addGrayScale");
const logError  = require("debug")("addGrayScale:error");

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

if (process.env.PHOTO_TYPE !== "DINEIN" && process.env.PHOTO_TYPE !== "TAKEOUT"  ) {
	logError("PHOTO_TYPE is not valid, it should be set to DINEIN or TAKEOUT");
	return;
}


const takeOutRun = process.env.PHOTO_TYPE === "TAKEOUT";
log("takeOutRun = %s", takeOutRun);


log("process.env.PRODUCTION_DB				= %s"   , process.env.PRODUCTION_DB === "1" ? "Production" : "Test_Android_App");
log("process.env.PHOTO_TYPE					= %s %s", process.env.PHOTO_TYPE,  typeof process.env.PHOTO_TYPE);

log("only one restaurant - argv[2])			= %s %s" ,process.argv[2],typeof process.argv[2] );

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
			    log("#### Now excute .... takeOutRun = %s", takeOutRun);
			    setParseConnection();
			    // Read promotions from disk and schedule one if needed
				add_gray_scale_images(takeOutRun);
					

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
		Parse.serverURL = "http://10.10.10.197:1337/pserver";
		//Parse.serverURL = 'http://127.0.0.1:1337/pserver';
	}
	else {
		// Test Parse Server credentails
		Parse.initialize(TEST_APP_KEY, TEST_JAVA_SCRIPT_KEY, TEST_MASTER_KEY);
		//Parse.serverURL = 'https://www.mmparse.com/pserver';
		Parse.serverURL = "http://10.10.10.197:1337/pserver";
		//Parse.serverURL = 'https://cf6b06b5.ngrok.io/pserver';
	}

}


// Read the promotions from disk and schedule one if this is not a validation run
function add_gray_scale_images(takeOutRun) {

	var promise = new Promise((resolve, reject) => {


		// Try to find the reward object of the person that own the invide code
		var restaurantQuery =  new Parse.Query(AppConstants.KParseRestaurantClass);

		//restaurantQuery.equalTo("objectId", "VfU1ZwYltx");

		if (takeOutRun) {
			restaurantQuery.equalTo(AppConstants.KParseRestaurantAllowTakeOutKey, true);
		}
		else {
			restaurantQuery.equalTo(AppConstants.KParseRestaurantAllowDineInKey, true);
		}


		// The query can return up to 1000 objects, there is a way to deal with it, but at the time we going to query for all users
		// we have less then 1000 users with email address, so this is not a problem
		restaurantQuery.limit(1000);

		let stats = {addedRestaurants : 0 , skippedRestaurants : 0};

		restaurantQuery.find({useMasterKey: true })
			.then((restaurants) => {

				if (!restaurants) {
					log("add_gray_scale_images did not find any restaurants");
					resolve("No restaurants founds to add gray scale image");
					return;
				}


				let restaurantsArray = [];

				// Check if we got a single object or an array
				if (Array.isArray(restaurants)){
					log("changeRewardObjects we found %s restaurants", restaurants.length);
					restaurantsArray = restaurants;
				}
				else {
					log("changeRewardObjects we 1 restaurant with id = %s", restaurants.id);
					restaurantsArray.push(restaurants);
				}

				// We excute the addition of the rewards in sequence in order not to load the server
				// http://stackoverflow.com/questions/20100245/how-can-i-execute-array-of-promises-in-sequential-order	

				restaurantsArray.reduce(function(curr, next) {
					    return curr.then(function() {

					    	log("Processing restaurant.id = %s", next.id);


					    	let primaryPhotoKey;
					    	// Decide which photo we convert
					    	if (takeOutRun){
					    		primaryPhotoKey = AppConstants.KParseRestaurantTakeOutMainPhotoKey;
					    	}
					    	else {
								primaryPhotoKey = AppConstants.KParseRestaurantPhotoKey;
					    	}

					    	if (!next.get(primaryPhotoKey)) {
					    		logError("Restaurant id %s missing key %s, skipping", next.id, primaryPhotoKey);
								
								++stats.skippedRestaurants;

					    		return Promise.resolve("Skipping");
					    	}

							let primaryGrayScalePhotoKey;

					    	// Decide which photo we convert
					    	if (takeOutRun){
					    		primaryGrayScalePhotoKey = AppConstants.KParseRestaurantTakeOutMainPhotoGrayKey;
					    	}
					    	else {
								primaryGrayScalePhotoKey = AppConstants.KParseRestaurantPhotoGrayKey;
					    	}

							if (next.get(primaryGrayScalePhotoKey)) {
					    		logError("Restaurant id %s gray scale allread exist, skipping key %s, skipping", next.id, primaryGrayScalePhotoKey);
								
								++stats.skippedRestaurants;

					    		return Promise.resolve("Skipping");
					    	}


					    	// next is the current restaurant
					    	return readImageURL(next, primaryPhotoKey)
					    		.then((args) => {

					    			if (!args || args.length !== 2) {
					    				logError("changeRewardObjects failed to read image, did not get two args for object id %s", next.id);
										return Promise.reject("changeRewardObjects missing args");
					    			}

									let restaurantObj = args[0];
									let fileData 	  = args[1];

									log("*** 2. restuarnt id %s ", restaurantObj.id);

									return Jimp.read(fileData);
					    		})
					    		.then ((image) => {

					    			log("Jimp read image");

					    			return convertImage(image);

					    			//return image.greyscale().getBuffer( Jimp.MIME_JPEG, onBuffer);

					    		})
					    		.then ((grayscaled) => {

					    			log("Jimp read grayscaled %s", grayscaled.length);

									// http://stackoverflow.com/questions/33725285/cloud-code-creating-a-parse-file-from-url
									// http://stackoverflow.com/questions/17124053/node-js-get-image-from-web-and-encode-with-base64
									// Both options (data, data1) works
									var data = {
										base64 : new Buffer(grayscaled).toString('base64')
									};

									var file = new Parse.File("myfile.jpg", data );

									var fileSavePromise = file.save(null, { useMasterKey: true } );

									return Promise.all([Promise.resolve(next), fileSavePromise ]);

					    		})
					    		.then((args) => {
									let restaurantObj = args[0];
									let parseFile 	  = args[1];

									log("*** 3. restuarnt id %s ", restaurantObj.id);

									let primaryGrayScalePhotoKey;

							    	// Decide which photo we convert
							    	if (takeOutRun){
							    		primaryGrayScalePhotoKey = AppConstants.KParseRestaurantTakeOutMainPhotoGrayKey;
							    	}
							    	else {
										primaryGrayScalePhotoKey = AppConstants.KParseRestaurantPhotoGrayKey;
							    	}

									restaurantObj.set(primaryGrayScalePhotoKey, parseFile);

									return restaurantObj.save(null, { useMasterKey: true });

								})
								.then((restaurantObj) => {
									log("*** 4. restuarnt was saved id %s ", restaurantObj.id);

									++stats.addedRestaurants;
								})
					    		.catch((err) => {

					    			logError("add_gray_scale_images got an error reading rewards , err = %s", util.inspect(err));

									return Promise.reject("changeRewardObjects got error from Jimp reading file");

					    		});
					        
					    });
					}, Promise.resolve())
					.then(() => {
						log("add_gray_scale_images - All Done , stats = %s", util.inspect(stats) );
						resolve("Processed "+ restaurantsArray.length + " users . stats = " + util.inspect(stats) );
						return;
					})
					.catch((err) => {
						logError("add_gray_scale_images -  (2) Got error %s stack =\n%s", util.inspect(err, {showHidden: false, depth: null}), err.stack);	
						reject("add_gray_scale_images - Got error " + util.inspect(err, {showHidden: false, depth: null}));	
						return;
					});

			})
			.catch((err) => {
				logError("add_gray_scale_images got an error reading images (3) , err = %s stack = %s", util.inspect(err), err.stack);
				reject("add_gray_scale_images got an error reading rewards , err = " +  util.inspect(err));
				return;

			});

	});



	promise
		.then((result) => {
			logError("add_gray_scale_images All done ");
			return;
		})
		.catch((err) => {
			logError("add_gray_scale_images got an error reading images (1) , err = %s stack = %s", util.inspect(err), err.stack);
			return;
		});

	
}

function convertImage(image) {

	var promise = new Promise((resolve, reject) => {

		image.quality(40).greyscale().getBuffer( Jimp.MIME_JPEG, function (err, buffer) {
   			 if (err) {
    			return reject(err);
    		}

    		console.log(buffer);

    		resolve(buffer);


		});

	});

	return promise;
}




// Read file, return a promise 
function readImageURL(restaurantObj, key){

	var promise = new Promise((resolve, reject) => {

		requestImage(restaurantObj.get(key).url(), function (error, response, body) {
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


	return promise;

}





