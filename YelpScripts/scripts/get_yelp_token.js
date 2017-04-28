/*jslint node: true */

"use strict";

var Parse = require('parse/node');

const util = require('util');

//const moment    	= require("moment");
// https://github.com/tonybadguy/yelp-fusion


// // http://stackoverflow.com/questions/17124053/node-js-get-image-from-web-and-encode-with-base64
// In case we bring binary data make sure that request does not do any encoding otherwise parse have an issue with the raw image saved
// Explantion why it is required -
// From https://github.com/request/request
// encoding - Encoding to be used on setEncoding of response data. If null, the body is returned as a Buffer. Anything else (including the default value of undefined) 
// will be passed as the encoding parameter to toString() (meaning this is effectively utf8 by default). 
// (Note: if you expect binary data, you should set encoding: null.)


// By default debug will log to stderr, however this can be configured per-namespace by overriding the log method:

const log    = require("debug")("addGrayScale");
const logError  = require("debug")("addGrayScale:error");

const yelp = require('yelp-fusion');

// Define the default time zone

// Define the default time zone

let yelpClientId = "A0jP4S5ssWuQmTC3mIoLzw";
let yelpClientSecret = "QW0xZWrNr86lrllkEAOI3NZGlLk9lCPKq7tgawAf5QnEigCihJvxg4mLuHVgTv3Z";

// Run on April 28, 2017 
// Got token - hdBAKMg4_rMuKtnC3JoOTC7IvYsx30l5Aehq2Ax4KTAJKEcwnEMnn8Oo6PheIr0Qqwafuqz0bLbTN4maLQgeISrxk37tux0VCcgS5Xf7V37YoCTtqezQQ9WDSGwDWXYx
// Good for 180 days


yelp.accessToken(yelpClientId, yelpClientSecret)
.then(response => {
  console.log(response.jsonBody.access_token);
}).catch(e => {
  console.log(e);
});
