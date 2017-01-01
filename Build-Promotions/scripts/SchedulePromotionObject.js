/*jslint node: true */

"use strict";

const util = require('util');

const log      = require('debug')('caching:CachedObject');
const logError = require('debug')('caching:error');

module.exports = class SchedulePromotionObject {
	constructor(restaurantID, restaurantName, object){
		this.restaurantID   = object.restaurantID;
		this.object  		= object;
	}

	get JSON() {
		return JSON.stringify({
			restaurantID 	: this.restaurantID,
			object			: this.object
		});
	}


	static fromJSON(json){
		var data = JSON.parse(json);
		var cachedObject = new CachedObject(data.restaurantID, data.object);
		//log(json +' => '+ util.inspect(cachedObject));
        return cachedObject;
	}

};