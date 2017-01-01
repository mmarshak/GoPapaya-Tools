/*jslint node: true */

"use strict";

var Parse = require('parse/node');

const util 		= require('util');
const log    	= require("debug")("testMoment");
const logError  = require("debug")("testMoment:error");
const moment    = require("moment");
const moment_range    = require("moment-range");

log("***hello***");

// local time zone
var m1 = moment({hour:15, minute : 10});

log(m1);

// display in UTC
log(m1.utc());

// Check if can handle time zone correctly
log("");

// Note - month is zero based , days are 1 based
var momentTimeWithDayLightSaving = moment({ y    :2016,  M     :11, d   :5, h    :15, m      :10, s      :3, ms          :123});

var momentTimeBeforehDayLightSaving = moment({ y    :2016,  M     :6, d   :5, h    :15, m      :10, s      :3, ms          :123});

log(momentTimeWithDayLightSaving);
log(momentTimeWithDayLightSaving.utc());
log("");
log(momentTimeBeforehDayLightSaving);
log(momentTimeBeforehDayLightSaving.utc());

// Handle converstion to UTC and time zone correctly.

log(m1.isValid());

var m2 = moment();

log(m2);
m2.hours(19);
log(m2);
log(m2.date());
//  Sunday as 0 and Saturday as 6.
log(m2.day());
log(m2.weekday());	// Locale Aware
log(m2.dayOfYear());	// Locale Aware

m2.month("Ja");
log(m2);

log(moment([2016, 5, 29]).fromNow());

var m3 = moment({ y    :2016,  M     :11, d   :28, h    :15, m      :10, s      :3, ms          :123});
var m4 = moment({ y    :2016,  M     :11, d   :28, h    :15, m      :10, s      :3, ms          :123});

log(m3==m4);		// give false
log(m3===m4);		// give false

log (m3.isSame(m4));	// gives true

log(moment.locale());


m3.add(6, "days");

log(m3);

log(moment.months());

/* Returns - testMoment [ 'January',
  testMoment   'February',
  testMoment   'March',
  testMoment   'April',
  testMoment   'May',
  testMoment   'June',
  testMoment   'July',
  testMoment   'August',
  testMoment   'September',
  testMoment   'October',
  testMoment   'November',
  testMoment   'December' ] */

log(moment.monthsShort());

/*
	Returns -

	[ 		   'Jan',
  testMoment   'Feb',
  testMoment   'Mar',
  testMoment   'Apr',
  testMoment   'May',
  testMoment   'Jun',
  testMoment   'Jul',
  testMoment   'Aug',
  testMoment   'Sep',
  testMoment   'Oct',
  testMoment   'Nov',
  testMoment   'Dec' ]

*/


log(moment.weekdays());

/* Returns -
[ 			   'Sunday',
  testMoment   'Monday',
  testMoment   'Tuesday',
  testMoment   'Wednesday',
  testMoment   'Thursday',
  testMoment   'Friday',
  testMoment   'Saturday' ]

*/

log(moment.weekdaysShort());
/* Returns - [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' */


var s1 = moment({ y    :2016,  M     :5, d   :12, h    :15, m      :10});
var e1 = moment({ y    :2016,  M     :5, d   :12, h    :15, m      :40});

var range1 = moment.range(s1, e1);

var s2 = moment({ y    :2016,  M     :5, d   :12, h    :15, m      :40});
var e2 = moment({ y    :2016,  M     :5, d   :12, h    :15, m      :55});

var range2 = moment.range(s2, e2);


log("intersect = %s", range1.intersect(range2) != null ? "Yes" : "No" );
log(range1.intersect(range2));
