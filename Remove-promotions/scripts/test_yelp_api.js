/*jslint node: true */

"use strict";

var Parse = require('parse/node');

const util = require('util');

const misc_util		= require('./misc-utils');


// By default debug will log to stderr, however this can be configured per-namespace by overriding the log method:

const log       = misc_util.createLogger("yelp:test-yelp" );
const logError  = misc_util.createLogger("yelp:test-yelp:error");


const yelp = require('yelp-fusion');

// Define the default time zone

// Define the default time zone

// Token was generated on April 28, 2017, and is good till October 27, 2017
let yelpToken = "hdBAKMg4_rMuKtnC3JoOTC7IvYsx30l5Aehq2Ax4KTAJKEcwnEMnn8Oo6PheIr0Qqwafuqz0bLbTN4maLQgeISrxk37tux0VCcgS5Xf7V37YoCTtqezQQ9WDSGwDWXYx";


const client = yelp.client(yelpToken);

client.search({
  term:'Dosa Factory',
 // location: 'san francisco, ca'
  location: 'Boston , MA',
  limit : 2

})
	.then(response => {

		if (response && response.jsonBody && response.jsonBody && response.jsonBody.total !== undefined) {

			let numberOfResults =  response.jsonBody.total;

			log("Got %s results", numberOfResults);

			if (numberOfResults > 0) {

				// http://stackoverflow.com/questions/34355770/syntaxerror-unexpected-token-u-at-object-parse-native-nodejs-for-json-parse
				if (Array.isArray(response.jsonBody.businesses)) {
					log("businesses is array");
				}
				else {
					log("businesses is not an array");
				}

				let businesses = response.jsonBody.businesses;

				let maxLoops = Math.min(businesses.length, 20);

				for (let i=0; i < maxLoops ; ++i){
					log(businesses[i].name);
					log(businesses[i].rating);
					log(businesses[i].id);
					log(businesses[i].location.address1);
					log(businesses[i].location.city);
					log(businesses[i].coordinates);
					log(businesses[i].coordinates.latitude);
					log(businesses[i].coordinates.longitude);
				}

			}


		}
		else {
			logError("Missing response");
		}

 	 	//log(response.jsonBody.businesses[0]);
		//log(util.inspect(response,  {showHidden: false, depth: null}));
		//log(response.jsonBody.businesses[0].location.address1);
 	 	//log(util.inspect(response.jsonBody));

 	 	
		client.reviews('cafe-med-boston').then(response => {
		  console.log(response.jsonBody.reviews[2].text);
		}).catch(e => {
		  console.log(e);
		});




	})
	.catch(e => {
  		console.log(e);
	});