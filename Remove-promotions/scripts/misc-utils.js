/*jslint node: true */

"use strict";

const util      = require('util');
const log       = require("debug")("parse-server:misc-utils");
const logError  = require("debug")("parse-server:error");

const fs      = require("fs-extra");
const path      = require("path");

const randomstring = require("randomstring");

var   moment    = require('moment-timezone');
const moment_range  = require("moment-range");

const debug  =  require("debug");

exports.didFieldChanged = function(oldValue, newValue){

	log("oldValue = %s", oldValue);
	log("newValue = %s", newValue);

	if (oldValue === undefined || oldValue.length === 0) {

		if (newValue !== undefined && newValue.length > 0){
			return true;
		}
		else {
			return false;
		}
	}
	else {
		if (newValue === undefined || newValue.length === 0) {
			return true;
		}
		else {
			return false;
		}
	}

};


// being able to enable/disable debug programmatically
// https://github.com/visionmedia/debug/issues/275
/**
 * Creates a debug logger object for a given scope (a.k.a. namespace)
 * and if the level of logging happens to be `error` then programatically
 * enables that namespace.
 *
 * Wanting to always enable errors, led to a minor implementation change
 * such that now log_level (only for error) also gets added to the namespace dynamically.
 *
 * So if DEBUG does not enable `my:namespace` explicitly, even then:
 * > my:namespace:error (will be enabled)
 * ... but `my:namespace` will be left as disabled.
 *
 * @param level
 * @param scope
 * @returns {*}
 */
//exports.createLogger = function(level, scope){
exports.createLogger = function(scope){

	var level;

  /* NOTE: Moved it, in order to create fewer objects.
   *       If left here, then we would end up with separate objects for
   *         > my:namespace:info
   *         > my:namespace:debug
   *         > my:namespace:trace
   *       as well!
   */
  //scope += ':' + level;

  // enable namespace programmatically
  // https://github.com/visionmedia/debug/issues/275
  if (level === 'error') {
    scope += ':' + level;
    console.log('will try to enable namespace:', scope);
    // NOTE: the goal is to enable `my:namespace:error` when DEBUG is not set for `my:namespace`
    //       but this code will run even when `DEBUG=my:namespace` ...
    //       Yet it doesn't seem to cause any problems or conflict so its fine, I suppose.
    require('debug').enable(scope);
  }

 require('debug').enable(scope);

  var logger;
  if (scope) {
    logger = debug(scope);
  } else {
    logger = debug;
  }
  return logger;
};


/* Compare versions of code */
// http://stackoverflow.com/questions/7717109/how-can-i-compare-arbitrary-version-numbers
/*
 Examples - 
var v1 = "2.2.1";
var v2 = "1.2.2";

log("v1 = %s", v1);
log("v2 = %s", v2);
log("gteVersion(v1,v2) = %s", gteVersion(v1,v2));
log("ltVersion(v1,v2)  = %s", ltVersion(v1,v2));

*/

function cmpVersion(a, b) {

    // Do a deep copy
    // http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
    //a = JSON.parse(JSON.stringify(a));
    //b = JSON.parse(JSON.stringify(b));


    var i, cmp, len, re = /(\.0)+[^\.]*$/;
    a = (a + '').replace(re, '').split('.');
    b = (b + '').replace(re, '').split('.');
    len = Math.min(a.length, b.length);
    for( i = 0; i < len; i++ ) {
        cmp = parseInt(a[i], 10) - parseInt(b[i], 10);
        if( cmp !== 0 ) {
            return cmp;
        }
    }
    return a.length - b.length;
}

exports.gteVersion = function gteVersion(a, b) {
    return cmpVersion(a, b) >= 0;
};

function ltVersion(a, b) {
    return cmpVersion(a, b) < 0;
}

/*  Examples 
  leftPad(1, 2) // 01
  leftPad(10, 2) // 10
  leftPad(100, 2) // 100
  leftPad(1, 3) // 001
  leftPad(1, 8) // 00000001

*/

exports.leftPad = function(number, targetLength) {
    var output = number + '';
    while (output.length < targetLength) {
        output = '0' + output;
    }
    return output;
};


exports.generateRandomString = function() {

  // Generate a unique id for the push notification
  var identifier = randomstring.generate({
            length: 12,
            charset: 'alphanumeric'
          });

  if (!identifier || identifier.length === 0) {

        log ("identifier was zero regenerate a new one = %s", identifier);

        identifier = randomstring.generate({
                length: 12,
                charset: 'alphanumeric'
              });
  }

  return identifier;


};


// Read a text file and return a Promise with the text as string
/**** Read file *****/

function filePath(directory, fileName){

  //log("filePath = %s", path.join(directory , fileName));

  return path.join(directory , fileName);
}

exports.readTextFile =  function(directory, fileName) {
  const readFrom = filePath(directory, fileName);

  //log("readFrom = %s", readFrom);

  return new Promise((resolve, reject) => {
    fs.readFile(readFrom, "utf8" , (err, data) => {
      if (err) {
          reject(err);
      }
      else {
          resolve(data);      
        
      } 
    });

  });
}; 






