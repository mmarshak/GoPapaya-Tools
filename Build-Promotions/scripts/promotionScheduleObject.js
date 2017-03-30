/*jslint node: true */

"use strict";

const util = require('util');

const log      = require('debug')('caching:CachedObject');
const logError = require('debug')('caching:error');

module.exports = class PromotionScheduleObject {
	constructor(restaurantObjectId, restaurantName, startTime, endTime, discount, duration, alcohol, tableFor2, tableFor4, tableFor5 ,tableFor6, 
		maxNumberOfOrders, maxPartySize, promotionFamily, promotionTypeBitMask ){

		this.restaurantObjectId = restaurantObjectId;
		this.restaurantName		= restaurantName;
		this.startTime   		= startTime;
		this.endTime   			= endTime;
		this.discount   		= discount;
		this.duration			= duration;
		this.alcohol			= alcohol;
		this.tableFor2   		= tableFor2;
		this.tableFor4   		= tableFor4;
		this.tableFor5   		= tableFor5;
		this.tableFor6   		= tableFor6;

		this.maxNumberOfOrders    = maxNumberOfOrders;
		this.maxPartySize		  = maxPartySize;
		this.promotionFamily      = promotionFamily;
		this.promotionTypeBitMask = promotionTypeBitMask;
		
	}

/*
	get restaurantObjectId() {
		return this.restaurantObjectId;
	}

	get startTime() {
		return this.startTime;
	}

	get endTime() {
		return this.endTime;
	}

	get discount() {
		return this.discount;
	}

	get tableFor2() {
		return this.tableFor2;
	}

	get tableFor4() {
		return this.tableFor4;
	}


	get tableFor5() {
		return this.tableFor5;
	}

	get tableFor6() {
		return this.tableFor6;
	}
*/

/*

	static fromJSON(json){
		var data = JSON.parse(json);
		var cachedObject = new CachedObject(data.key, data.timeStamp, data.object);
		//log(json +' => '+ util.inspect(cachedObject));
        return cachedObject;
	}
*/
};