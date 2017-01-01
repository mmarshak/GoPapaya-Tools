/*jslint node: true */

"use strict";

var Parse = require('parse/node');

const util = require('util');

//const moment    	= require("moment");
var   moment 		= require('moment-timezone');
const moment_range  = require("moment-range");

var Parse = require('parse/node');

// By default debug will log to stderr, however this can be configured per-namespace by overriding the log method:

const log    = require("debug")("setPromotions");
const logError  = require("debug")("setPromotions:error");

// set this namespace to log via console.log
//log.log = console.log.bind(console); // don't forget to bind to console!
//logError.log = console.log.bind(console); // don't forget to bind to console!

const json_file_reader = require("./json-file-reader");

var PromotionScheduleDayObject = require("./PromotionScheduleDayObject");
var PromotionScheduleObject    = require("./promotionScheduleObject");

const AppConstants        = require("./app-constants");

var Restaurant = Parse.Object.extend(AppConstants.KParseRestaurantClass);
var Promotion  = Parse.Object.extend(AppConstants.KParsePromotionClass);


// Define the default time zone
moment.tz.setDefault("America/New_York");
//moment.tz.setDefault("America/Los_Angeles");

const DAYS_OF_WEEK = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// When connecting to Parse server - this are the crenetail for the Android test DB App
//Parse.initialize("2wlLD2heOTJngATM5tu7w8EVmWdTA7TYTE1Ek6eE");
//Parse.serverURL = 'https://cf6b06b5.ngrok.io/pserver';

// Live Parse Server credentails
Parse.initialize("l7F9xkTQrSxhf0RuXVlZ7MpC1rM96aeQrN8D3lGd");
Parse.serverURL = 'https://www.mmparse.com/pserver';


if (process.env.RESTAURANT_PROMOTION_DIR === undefined) {
	logError("RESTAURANT_PROMOTION_DIR is not defined");
	return;
}

log("process.argv[2]) = " + process.argv[2]);

// Read promotions from disk and schedule one if needed
scheduleFuturePromotions(process.env.ACTIVE_RUN === undefined);


// Read the promotions from disk and schedule one if this is not a validation run
function scheduleFuturePromotions(validationRunOnly) {

	json_file_reader.filelist()
		.then((files) =>  {
			log(files);

			log("files is array - %s", Array.isArray(files));

			if (files.length === 0) {
				return;
			}

			let readPromises = [];
			let readPromise;

			for (var fileName of files) {
				log("Reading file %s", fileName);

				readPromise = json_file_reader.read(fileName);
				readPromises.push(readPromise);	
			}

			// http://stackoverflow.com/questions/20100245/how-can-i-execute-array-of-promises-in-sequential-order

			Promise.all(readPromises)
				.then((results) => {
			
					// The reduce make sure we perform the operation in sequence
					// http://stackoverflow.com/questions/20100245/how-can-i-execute-array-of-promises-in-sequential-order
					results.reduce(function(curr, next) {
						return curr.then(function() {

							let promotionScheduleObjectsArray;
							let validationResult;
							let startTime;
							let endTime;

							if (process.argv[2] !== undefined &&
								process.argv[2] !== (next.fileName + ".json")) {
								log("**** Skipping file %s due to argv[2] %s", next.fileName, process.argv[2]);
								return Promise.resolve("Skipping file " + next.fileName + " due to argv[2] " + process.argv[2]);
							} 	


							log("***fileName = %s  , object = %s", next.fileName,util.inspect(next.object, {showHidden: false, depth: null}));
							validationResult = validatePromotionSchedule( next.fileName,  next.object);

							startTime = validationResult.startDate;		// start at 00:00 hh:mm
							endTime   = validationResult.endDate;

							startTime = moment(startTime).hour(0).minute(0).second(0).toDate();	
							endTime = moment(endTime).hour(23).minute(59).second(59).toDate();

							promotionScheduleObjectsArray = validationResult.promotionScheduleObjectsArray;


							log("*** fileName = %s , Object is valid - %s", next.fileName, promotionScheduleObjectsArray !== null ? promotionScheduleObjectsArray.length : null  );

							if (promotionScheduleObjectsArray === null || promotionScheduleObjectsArray.length === 0) {
								logError("*** fileName = %s , has empty promotionScheduleObjectsArray = %s", next.fileName, promotionScheduleObjectsArray);
								return Promise.reject("*** fileName = " + next.fileName + " , has empty promotionScheduleObjectsArray = " + promotionScheduleObjectsArray);

							}

							let restaurantName  	= promotionScheduleObjectsArray[0].restaurantName;
							let restaurantObjectId 	= promotionScheduleObjectsArray[0].restaurantObjectId;

							log ("restaurantName = %s , restaurantObjectId= %s, startTime = %s , endTime = %s",restaurantName, restaurantObjectId, startTime, endTime);

							let restaurant = Restaurant.createWithoutData(restaurantObjectId);	

							return restaurant.fetch()
								.then((restaurantObj) => {

									if (restaurantObj === null || restaurantObj === undefined ) {
										logError("*** fileName = %s , restaurantName - %s restaurantObjectId = %s Did not find restaurant object", next.fileName, 
											restaurantName, restaurantObjectId );	

										return Promise.reject("fileName " + next.fileName + " Did not find restaurant object in DB");
									
									}

									if (restaurantObj.get(AppConstants.KParseRestaurantNameKey) !== restaurantName) {
										logError("*** fileName = %s , restaurantName - %s restaurantObjectId = %s Did not match restaurant name %s %s", next.fileName, 
											restaurantName, restaurantObjectId,restaurantObj.get(AppConstants.KParseRestaurantNameKey), restaurantName );	

										return Promise.reject("fileName " + next.fileName + " Mismatch in restaurant name");
									} 
									else {
										log("Restaurant name match");
									}


									let query = new Parse.Query(Promotion);

									query.equalTo(AppConstants.KParsePromotionRestaurantKey, restaurant);	
									query.greaterThanOrEqualTo(AppConstants.KParsePromotionStartTimeKey, startTime);
									query.lessThanOrEqualTo(AppConstants.KParsePromotionEndTimeKey, endTime);

									query.notEqualTo(AppConstants.KParsePromotionCanceledKey, true);

									return query.find()
										.then((objects) => {

											log("%s Got %s results for promotion query", next.fileName, objects.length);

											 for (var i = 0; i < objects.length; i++) {
									     		 var object = objects[i];
									      		log("Promotion id %s , restuarnt id %s and its attributes", object.id, object.get("restaurant").id,  util.inspect( object.get("restaurant").attributes) );
									    	}

									    	if (objects.length > 0) {
									    		logError("*** fileName = %s , restaurantName - %s restaurantObjectId = %s There is allready other promotion for that time period %s", next.fileName, 
													restaurantName, restaurantObjectId,  restaurantName );	

													return Promise.reject("fileName " + next.fileName + " There is allready other promotion for that time period");
									    	}

									    	if (validationRunOnly) {
									    		log("VALIDATION_RUN is set so we do not actually schedule the promotions ");
									    		return Promise.resolve("VALIDATION_RUN is set so we do not actually schedule the promotions");
									    	}

									    	// Save promotion to backend		

									    	let newPromotions = [];

									    	for (let promotionScheduleObject of promotionScheduleObjectsArray) {

									    		let promotion = new Promotion();
									    		let acl = new Parse.ACL();
												acl.setPublicReadAccess(true);
												acl.setPublicWriteAccess(true);
												promotion.setACL(acl);	

												promotion.set(AppConstants.KParsePromotionStartTimeKey 		 , promotionScheduleObject.startTime);
												promotion.set(AppConstants.KParsePromotionEndTimeKey 	     , promotionScheduleObject.endTime);
												promotion.set(AppConstants.KParsePromotionOriginalEndTimeKey , promotionScheduleObject.endTime);
										    											        
											    promotion.set(AppConstants.KParsePromotionTotalTables2Key,    promotionScheduleObject.tableFor2 );
											    promotion.set(AppConstants.KParsePromotionTotalTables4Key,    promotionScheduleObject.tableFor4 );
											    promotion.set(AppConstants.KParsePromotionTotalTables5Key,    promotionScheduleObject.tableFor5 );
											    promotion.set(AppConstants.KParsePromotionTotalTables6Key,    promotionScheduleObject.tableFor6 );
											
											    promotion.set(AppConstants.KParsePromotiontMaxDiscountKey,    promotionScheduleObject.discount);
											    promotion.set(AppConstants.KParsePromotionAlcoholIncludedKey, promotionScheduleObject.alcohol);
											    promotion.set(AppConstants.KParsePromotionMaxHoldTimeKey,     promotionScheduleObject.duration);
											    promotion.set(AppConstants.KParsePromotionLocationKey,        restaurantObj.get(AppConstants.KParseRestaurantLocationKey));
											    
											    promotion.set(AppConstants.KParsePromotionCanceledKey       , false);
											    promotion.set(AppConstants.KParsePromotionStoppedKey        , false);
											       							    
												promotion.set(AppConstants.KParsePromotionBlockTableSpilloverKey, false);

											    promotion.set(AppConstants.KParsePromotionBlockSingleGuestKey, false); 
											  											       
										        promotion.set(AppConstants.KParsePromotionRestaurantKey, restaurantObj);
											    		
										        var tempArray = [""];
											    		   
										        promotion.set(AppConstants.KParsePromotionSpecialNotesKey, tempArray);

											    log("Promotion = %s", util.inspect(promotion));

											    newPromotions.push(promotion);
									    	}

									    	log("*** fileName = %s , restaurantName - %s restaurantObjectId = %s generating %s promotions", next.fileName, 
													restaurantName, restaurantObjectId,  newPromotions.length );	

									    	return Parse.Object.saveAll(newPromotions);	

										});


									});


						});

					}, Promise.resolve())
					.then(() => {
						log("All Done " );
					})
					.catch((err) => {
						logError("Got error %s", util.inspect(err, {showHidden: false, depth: null}));	
					});


				})
				.catch((err) => {
					logError("Got error readig file %s", util.inspect(err, {showHidden: false, depth: null}));	
				})
			;

		})
		.catch((err) => {
			logError("Got error reading files in directory %s ", util.inspect(err, {showHidden: false, depth: null}));
		});
}


// Validate the promotion object
function validatePromotionSchedule(fileName, object) {

	log("validatePromotionSchedule - start processing fileName - %s", fileName);

	var promotionScheduleDayObjectsArray = [];

	// Basic checks

	if (object === undefined || !object) {
		logError("Validation error - object is undefined or null, object = %s", object);
		return null;
	}

	if (object.restaurantID === undefined|| object.restaurantID.length === 0) {
		logError("Validation error -  restaurantID , object = %s", util.inspect(object, {showHidden: false, depth: null}));
		return null;
	}

	var restaurantObjectId = object.restaurantID;

	if (object.restaurantName === undefined || object.restaurantName.length === 0){
		logError("Validation error - restaurantName, object = %s", util.inspect(object, {showHidden: false, depth: null}));
		return null;
	}

	if (object.startDate === undefined || object.startDate.length === 0){
		logError("Validation error - startDate is missing , object = %s", util.inspect(object, {showHidden: false, depth: null}));
		return null;
	}

	if (object.endDate === undefined || object.endDate.length === 0){
		logError("Validation error - endDate is missing , object = %s", util.inspect(object, {showHidden: false, depth: null}));
		return null;
	}

	if (object.skipDates && !Array.isArray(object.skipDates)){
		logError("Validation error - skipDates is not an array , object = %s", util.inspect(object, {showHidden: false, depth: null}));
		return null;
	}

	if (object.schedules === undefined){
		logError("Validation error - schedules is missing , object = %s", util.inspect(object, {showHidden: false, depth: null}));
		return null;
	}

	if (!Array.isArray(object.schedules)){
		logError("Validation error - schedules  array is missing , object = %s", util.inspect(object, {showHidden: false, depth: null}));
		return null;
	}

	if (object.schedules.length === 0 ){
		logError("Validation error - schedules is empty , object = %s", util.inspect(object, {showHidden: false, depth: null}));
		return null;
	}

	// Check the format of startDate

	var startDate = moment(object.startDate, "MM/DD/YYYY");

	if (!startDate.isValid()) {
		logError("Validation error - startDate  is in wrong format need to be MM/DD/YYYY , object = %s", util.inspect(object, {showHidden: false, depth: null}));
		return null;
	}

	// Check the format of endDate

	var endDate = moment(object.endDate, "MM/DD/YYYY");
	
	if (!endDate.isValid()) {
		logError("Validation error - endDate  is in wrong format need to be MM/DD/YYYY , object = %s", util.inspect(object, {showHidden: false, depth: null}));
		return null;
	}


	if (endDate.isBefore(startDate)) {
		logError("Validation error - endDate is before startDate, object = %s", util.inspect(object, {showHidden: false, depth: null}));
		return null;
	}


	// Check the format of skipDates

	if (object.skipDates && object.skipDates.length > 0) {

		for (let skipDate of object.skipDates) {
			if (!moment(skipDate, "MM/DD/YYYY").isValid()) {
				logError("Validation error - skipDates have invalid date format need to be MM/DD/YYYY , object = %s", util.inspect(object, {showHidden: false, depth: null}));
				return null;
			}
		}
	}

	// Check the format of schedules

	for (let schedule of object.schedules) {

		if (schedule.name === undefined || schedule.name.length === 0) {
			logError("Validation error - schedule's name is missing, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}

		// Check day of the week
		if (schedule.dayOfWeek === undefined) {
			logError("Validation error - schedule's dayOfWeek is missing, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}

		if (!Array.isArray(schedule.dayOfWeek) || schedule.dayOfWeek.length === 0) {
			logError("Validation error - schedule's dayOfWeek is not array or empty, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}


		// Check day of the week 
		for (let day of schedule.dayOfWeek){
			if (DAYS_OF_WEEK.indexOf(day) === -1) {
				logError("Validation error - schedule's dayOfWeek is not valid = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] , object = %s", util.inspect(object, {showHidden: false, depth: null}));
				return null;
			}
		}

		// Check start time 
		if (schedule.startTime === undefined) {
			logError("Validation error - schedule's startTime is missing, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}

		if (!moment(schedule.startTime, "hh:mma").isValid()) {
			logError("Validation error - schedule's startTime is in wrong formart hh:mmam[pm], schedule.startTime = %s object = %s", schedule.startTime, util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}
		

		// Check end time 
		if (schedule.endTime === undefined) {
			logError("Validation error - schedule's endTime is missing, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}

		if (!moment(schedule.endTime, "hh:mma").isValid()) {
			logError("Validation error - schedule's endTime is in wrong formart hh:mmam[pm], schedule.endTime = %s object = %s", schedule.endTime, util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}
		

		// Check discount

		if (schedule.discount === undefined) {
			logError("Validation error - schedule's discount is missing, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}

		if (!Number.isInteger(schedule.discount)) {
			logError("Validation error - schedule's discount is not a number, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}

		if (schedule.discount < 0 || schedule.discount > 50) {
			logError("Validation error - schedule's discount is out of range 0-50, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}


		// Check duration in minutes

		if (schedule.duration === undefined) {
			logError("Validation error - schedule's duration is missing, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}

		if (!Number.isInteger(schedule.duration)) {
			logError("Validation error - schedule's duration is not a number, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}

		if (schedule.duration < 1800 || schedule.duration > 7200 ) {
			logError("Validation error - schedule's discount is out of range 1800-7200 seconds, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}

		// Check alcohol 

		if (schedule.alcohol === undefined) {
			logError("Validation error - schedule's alcohol is missing, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}

		if (!Number.isInteger(schedule.alcohol)) {
			logError("Validation error - schedule's alcohol is not a number, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}

		if (schedule.alcohol < 0 || schedule.alcohol > 1 ) {
			logError("Validation error - schedule's discount is out of range 0-1 , object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}




		// Check tableFor2

		if (schedule.tableFor2 === undefined) {
			logError("Validation error - schedule's tableFor2 is missing, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}

		if (!Number.isInteger(schedule.tableFor2)) {
			logError("Validation error - schedule's tableFor2 is not a number, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}

		if (schedule.tableFor2 < 0 || schedule.tableFor2 > 100) {
			logError("Validation error - schedule's tableFor2 is out of range 0-100, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}


		// Check tableFor4
		if (schedule.tableFor4 === undefined) {
			logError("Validation error - schedule's tableFor4 is missing, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}

		if (!Number.isInteger(schedule.tableFor4)) {
			logError("Validation error - schedule's tableFor4 is not a number, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}

		if (schedule.tableFor4 < 0 || schedule.tableFor4 > 100) {
			logError("Validation error - schedule's tableFor4 is out of range 0-100, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}


		// Check tableFor5
		if (schedule.tableFor5 === undefined) {
			logError("Validation error - schedule's tableFor5 is missing, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}

		if (!Number.isInteger(schedule.tableFor5)) {
			logError("Validation error - schedule's tableFor5 is not a number, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}

		if (schedule.tableFor5 < 0 || schedule.tableFor5 > 100) {
			logError("Validation error - schedule's tableFor5 is out of range 0-100, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}

		// Check tableFor6
		if (schedule.tableFor6 === undefined) {
			logError("Validation error - schedule's tableFor6 is missing, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}

		if (!Number.isInteger(schedule.tableFor6)) {
			logError("Validation error - schedule's tableFor6 is not a number, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}

		if (schedule.tableFor6 < 0 || schedule.tableFor6 > 100) {
			logError("Validation error - schedule's tableFor6 is out of range 0-100, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}

		if (schedule.tableFor2 + schedule.tableFor4 + schedule.tableFor5 + schedule.tableFor6 === 0 ) {
			logError("Validation error - schedule's total number (2,4,5,6) can not be zero, object = %s", util.inspect(object, {showHidden: false, depth: null}));
			return null;
		}


		// Add this day promotion to promotionScheduleDayObjectsArray

		for (let day of schedule.dayOfWeek){
			let promotionScheduleDayObject = new PromotionScheduleDayObject(object.restaurantID, object.restaurantName , day, schedule.startTime, schedule.endTime, schedule. discount, 
				schedule.duration, schedule.alcohol, schedule.tableFor2,
				schedule.tableFor4, schedule.tableFor5, schedule.tableFor6);

			promotionScheduleDayObjectsArray.push(promotionScheduleDayObject);
		}

	}

	/*for (let entry of promotionScheduleDayObjectsArray){
		log(util.inspect(entry));
	}*/

	promotionScheduleDayObjectsArray.sort(function(promoObjectDay1, promoObjectDay2) {

		let startTime1, startTime2; 
		let endTime1, endTime2; 

		if(DAYS_OF_WEEK.indexOf(promoObjectDay1.day) < DAYS_OF_WEEK.indexOf(promoObjectDay2.day)) {
			return -1;
		}
		else if (DAYS_OF_WEEK.indexOf(promoObjectDay1.day) > DAYS_OF_WEEK.indexOf(promoObjectDay2.day)){
			return 1;
		}
		else {

			startTime1 = moment(promoObjectDay1.startTime ,"hh:mma");
			startTime2 = moment(promoObjectDay2.startTime, "hh:mma");
			endTime1   = moment(promoObjectDay1.endTime , "hh:mma");
			endTime2   = moment(promoObjectDay2.endTime , "hh:mma");

			if (startTime1.isBefore(startTime2)) {
				return -1;
			}
			else if (startTime2.isBefore(startTime1)) {
				return 1;
			}

			if (endTime1.isBefore(endTime2)) {
				return -1;
			}
			else if (endTime2.isBefore(endTime1)) {
				return 1;
			}
			return 0;
		}
	});

/*
	for (let entry of promotionScheduleDayObjectsArray){
		log(util.inspect(entry));
	}
*/
	log("promotionScheduleDayObjectsArray's length = %d", promotionScheduleDayObjectsArray.length );

	// Build all the promotionScheduleObjects

	let currentDate = moment(startDate);
	let currentDay;	// 0 -- based

	var promotionScheduleObjectsArray  		= [];
	var promotionScheduleObjectsRangesArray = [];
	
	let promotionScheduleObject;
	let promotionScheduleObjectsRange;
	let startPromotionTime, endPromotionTime;

	do {

		currentDay = currentDate.day(); // 0 - based

		// Check if this is a skip day
		if (object.skipDates && object.skipDates.length > 0) {

			for (let skipDate of object.skipDates) {

				//log("*** %s ", moment(skipDate, "MM/DD/YYYY").format(), cu )	

				if (moment(skipDate, "MM/DD/YYYY").isSame(currentDate)) {
					console.log("Skipping date %s", currentDate.format("MM/DD/YYYY"));
					currentDate.add(1, 'day');
					continue;
				}
			}
		}


		for (let dayPromotionObject of promotionScheduleDayObjectsArray){

			//console.log(util.inspect(currentDay));

			// Check if we have a promotion for this dayq
			if (currentDay === DAYS_OF_WEEK.indexOf(dayPromotionObject.day)) {

				//console.log("currentDate = " + currentDate.format());

				startPromotionTime = moment(currentDate).clone();
				startPromotionTime.hour(moment(dayPromotionObject.startTime, "hh:mma").hour());
				startPromotionTime.minute(moment(dayPromotionObject.startTime, "hh:mma").minute());

				endPromotionTime = moment(currentDate).clone();
				endPromotionTime.hour(moment(dayPromotionObject.endTime, "hh:mma").hour());
				endPromotionTime.minute(moment(dayPromotionObject.endTime, "hh:mma").minute());

				promotionScheduleObject = new PromotionScheduleObject(dayPromotionObject.restaurantObjectId, dayPromotionObject.restaurantName,  startPromotionTime.toDate(), endPromotionTime.toDate(), 
					dayPromotionObject.discount, dayPromotionObject.duration, dayPromotionObject.alcohol, dayPromotionObject.tableFor2, dayPromotionObject.tableFor4, dayPromotionObject.tableFor5 , dayPromotionObject.tableFor6);


				promotionScheduleObjectsArray.push(promotionScheduleObject);

				promotionScheduleObjectsRange = moment.range(startPromotionTime, endPromotionTime);

				promotionScheduleObjectsRangesArray.push(promotionScheduleObjectsRange);

			}
		}

		currentDate.add(1, 'day');


	} while(!currentDate.isAfter(endDate));


	for (let entry of promotionScheduleObjectsArray){
		console.log("** "+ util.inspect(entry));
	}
		
	
	log("fileName %s promotionScheduleObjectsArray's length = ", fileName , promotionScheduleObjectsArray.length );
	log("fileName %s promotionScheduleObjectsRangesArray's length = ", fileName, promotionScheduleObjectsRangesArray.length );


	// Check for overlapping
	for (let i=0 ; i < promotionScheduleObjectsRangesArray.length ; ++ i) {
		for (let j=i+1 ; j < promotionScheduleObjectsRangesArray.length ; ++ j) {
			if (promotionScheduleObjectsRangesArray[i].intersect(promotionScheduleObjectsRangesArray[j])) {
				logError("Detected overlapping of promotions\nrange1 %s\nrange2 %s", promotionScheduleObjectsRangesArray[i], promotionScheduleObjectsRangesArray[j]);

				logError("fileName %s Range 1 , start %s  end %s", fileName, promotionScheduleObjectsArray[i].startTime, 
													   promotionScheduleObjectsArray[i].endTime);	

				logError("fileName %s Range 2 , start %s  end %s", fileName, promotionScheduleObjectsArray[j].startTime, 
													   promotionScheduleObjectsArray[j].endTime);	
		
				return null;
			}
		}
	}

	
	return {startDate : startDate.toDate(), endDate: endDate.toDate(), promotionScheduleObjectsArray : promotionScheduleObjectsArray};


}





