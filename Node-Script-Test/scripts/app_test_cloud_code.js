/*jslint node: true */

"use strict";

var Parse = require('parse/node');

const util = require('util');
const log    = require("debug")("appTest");
const logError  = require("debug")("appTest:error");

const parse_cache_fs = require("./parse-cache-fs");


// To connect to Parse.com
//Parse.initialize("2wlLD2heOTJngATM5tu7w8EVmWdTA7TYTE1Ek6eE",
//                   "fGCDyU5YTyV3sDcNx10MXAXKuRAVzEhwpFoGE8y3");

// When connecting to Parse server
Parse.initialize("2wlLD2heOTJngATM5tu7w8EVmWdTA7TYTE1Ek6eE");
Parse.serverURL = 'https://cf6b06b5.ngrok.io/pserver';

/*
var dataEmail = {toEmail : "mmarshak@gopapaya.mobi" ,
				subject  : "Hello from JS with a Promise" ,
				body     :"Check out party of 2 25%. Cool not."};


Parse.Cloud.run('sendEmail', dataEmail)
	.then((result) => {
		log("Email was send succesfully %s", util.inspect(result));
	})
	.catch((err) => {
		logError("Got an error sending email %s", util.inspect(err));
	});

var dataTextSMS = { number 	 : "6176100143" ,
			    	body     :"Check out party of 2 25%. Cool not."};


Parse.Cloud.run('sendTextSMS', dataTextSMS)
	.then((result) => {

		log("Text SMS was send succesfully %s", util.inspect(result));
	})
	.catch((err) => {
		logError("Got an error sending Text SMS %s", util.inspect(err));
	});

*/
var dataTextSMS = { number 	 		: "6176100143" ,
					activity		: "Reservation",
					restaurantName  : "New Wave", 
			    	firstName   	: "Marik",
			    	lastName    	: "Marshak",
			    	partySize   	: 3,
			    	discount    	: 25,
			    	duration    	: 30   };


Parse.Cloud.run('sendVoiceSMS', dataTextSMS)
	.then((result) => {

		log("Text Voice was send succesfully %s", util.inspect(result));
	})
	.catch((err) => {
		logError("Got an error sending Voice SMS %s", util.inspect(err));
	});



var dataSilentNotification = {	channel 	 		: "StoreVfU1ZwYltx" ,
							   	pushMessageType		: "pushCheckIn",
								alert  				: "Guest Check-in today", 
			    				sound   			: "success.caf",
			    				firstName    		: "Marik",
			    				lastName   			: "Marshak",
			    				userObjectId    	: "cAwFf8MpiC"};


Parse.Cloud.run('sendSilentPushWithPromise', dataSilentNotification)
	.then((result) => {

		log("Silent Notification was send succesfully %s", util.inspect(result));
	})
	.catch((err) => {
		logError("Got an error sending Silent Notification %s", util.inspect(err));
	});








