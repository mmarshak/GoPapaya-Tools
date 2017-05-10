/*jslint node: true */

"use strict";

const fs = require("fs-extra");
const path = require("path");
const util = require("util");

const log  	    = require("debug")("json-file-reader:fs-model");
const errorLog  = require("debug")("json-file-reader:error");

//log.log = console.log.bind(console); // don't forget to bind to console!
//errorLog.log = console.log.bind(console); // don't forget to bind to console!


function promotionsDir(){
	const dir = process.env.RESTAURANT_PROMOTION_DIR || "restaurants-schedule-promotion";

	return new Promise((resolve, reject) => {
		fs.ensureDir(dir , err => {
			if (err) {
				reject(err);
			}
			else {
				resolve(dir);
			}
		});
	});
}


function filePath(promotionsDir, fileName){
	return path.join(promotionsDir , fileName + ".json");
}

function readJSON(promotionsDir, fileName) {
	const readFrom = filePath(promotionsDir, fileName);
	return new Promise((resolve, reject) => {
		fs.readFile(readFrom, "utf8" , (err, data) => {
			if (err) {
				reject(err);
			}
			else {
				//log("readJSON " + data)

                resolve(JSON.parse(data));      
				
			}	
		});

	});
}


exports.read = function(fileName) {
    return promotionsDir().then(promotionsDir => {
        return readJSON(promotionsDir, fileName).then(object => {
//            log('READ '+ promotionsDir +'/'+ key +' '+ util.inspect(object));
             log('READ '+ promotionsDir +'/'+ fileName);
            return {fileName, object};
        });
    });
};


exports.keylist = function() {
    return promotionsDir().then(promotionsDir => {
        return new Promise((resolve, reject) => {
            fs.readdir(promotionsDir, (err, filez) => {
                if (err) return reject(err);
                if (!filez) filez = [];
                resolve({ promotionsDir, filez });
            });
        });
    })
   .then(data => {
        log('keylist dir='+ data.promotionsDir +' files='+ util.inspect(data.filez));
        var theObjects = data.filez.map(fname => {
            var key = path.basename(fname, '.json');
            log('About to READ '+ key);
            return readJSON(data.promotionsDir, key).then(object => {
                return object.restaurantID;
            });
        });
        return Promise.all(theObjects);
    });
};


exports.filelist = function() {
    return promotionsDir().then(promotionsDir => {
        return new Promise((resolve, reject) => {
            fs.readdir(promotionsDir, (err, filez) => {
                if (err) return reject(err);
                if (!filez) filez = [];
                resolve({ promotionsDir, filez });
            });
        });
    })
   .then(data => {
        log('keylist dir='+ data.promotionsDir +' files='+ util.inspect(data.filez));
        var theObjects = data.filez.map(fname => {
            var key = path.basename(fname, '.json');
            log('About to READ '+ key);
            return key;
        });
        return Promise.all(theObjects);
    });
};


exports.count   = function()    {
    return promotionsDir().then(promotionsDir => {
        return new Promise((resolve, reject) => {
            fs.readdir(promotionsDir, (err, filez) => {
                if (err) return reject(err);
                resolve(filez.length);
            });
        });
    });
};






