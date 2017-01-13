/*jslint node: true */

// Note - do not change the constants without chaning the Android and the iOS Apps

"use strict";

/*******

Version - 1.0   (updated 1/12017)

******/


const util      = require('util');
const log       = require("debug")("parse-server:notification-utils");
const logError  = require("debug")("parse-server:error");

// Push notifiaction alert types  (Silent notifiactions)

exports.KParsePushCheckIn                    = "pushCheckIn";             //
exports.KParsePushPending                    = "pushPending";             //
exports.KParsePushCancel                     = "pushCancel";              //
exports.KParsePushFutureMiss                 = "pushFutureMiss";          //
exports.KParsePushMiss                       = "pushMiss";                //


// Push Channels keys prefix
exports.KParseStoreChannelPrefix             = "Store";             //
exports.KParseGuestChannelPrefix             = "Guest";             //


// Type of activity for Voice SMS
exports.KVoiceSMSCheckIn                    = "VoiceSMSCheckIn";   	          //
exports.KVoiceSMSPending                    = "VoiceSMSCPending";             //
exports.KVoiceSMSCancel                     = "VoiceSMSCCancel";              //
exports.KVoiceSMShMiss                      = "VoiceSMSCMiss";                //


/*****************************/
// Parse Activity class keys
/****************************/

exports.KParseActivityClass                  = "Activity";


exports.KParseActivityRestaurantKey          = "restaurant";            	// PFObject
exports.KParseActivityUserKey                = "user";                  	// PFObject
exports.KParseActivityPromotionKey           = "promotion";             	// PFObject
exports.KParseActivityPendingTimeKey         = "pending";               	// NSDate       -- The time ther use said I am on my way (if any)
exports.KParseActivityCheckInTimeKey         = "checkin";               	// NSDate       -- The time of physical checking or beacon check in
exports.KParseActivityUserCancelTimeKey      = "cancel";                	// NSDate       -- The time that the user cancel the resevation (if any)

exports.KParseActivityGroupSizeKey           = "group_size";            	// NSNumber     -- The size of the group the customer asked for
exports.KParseActivityTableAssignKey         = "table_size";           	 	// NSNumber     -- The table size assign to the group, it can be same or larger then
    																		//                 group size !
exports.KParseActivityOriginalTable2AvailableKey = "tableFor2Available";    // BOOL         -- The table for 2 avaiability when the order was made
exports.KParseActivityOriginalTable4AvailableKey = "tableFor4Available";    // BOOL         -- The table for 4 avaiability when the order was made


//public static final String KParseActivitySystemCancelTimeKey    = "systemcancel";        // NSDate       -- The time that the system canceled the resevation (if any)

exports.KParseActivityInitLocationKey        = "init_locaton";          	// PFGeoPoint   -- The geo location where the record was created
exports.KParseActivityInitDistanceKey        = "init_distance";         	// NSNumber     -- The distnace from the resturant where
    																		//                 the record was created (this can be calaculated)

exports.KParseActivityCheckInLatLocKey       = "checkin_lat";                // NSNumber     -- The lat location where checking happen
exports.KParseActivityCheckInLongLocKey      = "checkin_long";               // NSNumber     -- The lat location where checking happen
exports.KParseActivityCheckInTimeStampLocKey = "checkin_location_timestamp"; // NSDate       -- The time stamp of the location we had when we had a check-in

exports.KParseActivitycheckInDistanceKey     = "checkin_distance";       	// NSNumber     -- The distnace from the resturant where
exports.KParseActivityCheckInBeaconRangeKey  = "beacon_distance";        	// NSNumber     -- The distnace from the beacon when we detect it

exports.KParseActivityDeviceVendorUUIDKey    = "device_UUID";          		// NSString

exports.KParseActivityRestaurantNameKey      = "rest_name";             	// NSString
exports.KParseActivityGuestScoreKey          = "guest_score";           	// NSNumber
exports.KParseActivityGuestNameKey           = "guest_name";           		// NSString


exports.KParseActivityRestaurantEmailKey      = "rest_email";             	// NSString  // duplicate of the restaurant object (make billing easier)
exports.KParseActivityRestaurantAddressKey    = "rest_address";           	// NSString  // duplicate of the restaurant object (make billing easier)
exports.KParseActivityRestaurantCityKey       = "rest_city";              	// NSString  // duplicate of the restaurant object (make billing easier)
exports.KParseActivityRestaurantStateKey      = "rest_state";             	// NSString  // duplicate of the restaurant object (make billing easier)
exports.KParseActivityRestaurantCountryKey    = "rest_country";           	// NSString  // duplicate of the restaurant object (make billing easier)
exports.KParseActivityRestaurantPhoneKey      = "rest_phone";             	// NSString  // duplicate of the restaurant object (make billing easier)

exports.KParseActivityGuestEmailKey           = "guest_email";            	// NSString  // duplicate of the restaurant object (make billing easier)

exports.KParseActivityMissReportedKey        = "miss_reported";        		// NSString

exports.KParseActivityAlcoholIncludedKey     = "alcoholIncluded";      		// BOOL              // duplicate of the promotion info (we need to for the future miss to avoid going to the server
exports.KParseActivitytMaxDiscountKey        = "maxDiscount";          		// NSNumber          // duplicate of the promotion info (we need to for the future miss to avoid going to the server

exports.KParseActivityMaxHoldTimeKey         = "maxHoldTime";           	// NSNumber in seconds

exports.KParseActivityVersionKey             = "version";            		// NSString - Do not use this field ever

exports.KParseActivityVNewVersionKey         = "NewVersion";         		// NSNumber

exports.KParseActivityTestUserKey            = "testUserCreate";     		// BOOL - The activity was created for test promotion

exports.KParseActivityInviteCodeKey          = "inviteCode";         		// NSSTRING


/*****************************/
// Parse Parse.User class keys
/****************************/

// The following is shared between regular sign up and facebook user
exports.KParseUserFirstNameKey       = "firstname";        // NSString
exports.KParseUserLastNameKey        = "lastname";         // NSString
exports.KParseUserEmailKey           = "email";            // NSString
exports.KParseUserPhoneNumberKey     = "phonenumber";      // NSString    - for facebook user it need to be added at the account info , initilize to -1

exports.KParseUserSignupWithEmailUserKey    = "SignUpwithEmail";         // BOOL      0 - regular signup user, 1 - facebook user

exports.KParseUserRestFilterDistanceKey = "restFilterDistance";  // NSNumber    - the filter we use to find close by restauarants in Miles (each user have different filter)

//public static final String KParseUserNotifyKey          = "notify";            // NSString  - indicate if the user want to know about new promotions
//public static final String KParseUserActivityKey        = "activity";          // PFObject  - pointer to the user last activity (if one exist)

// Kickbox.io email metrics
exports.KParseUserEmailScoreKey      = "emailScore";        // NSNumber
exports.KParseUserEmailResultKey     = "emailResult";       // NSString
exports.KParseUserEmailReasonKey     = "emailReason";       // NSString


exports.KParseUserFacebookUserKey    = "facebook";         // BOOL     1 - facebook user

exports.KParseUserSupportInviteCodeKey  = "userSupportInviteCode";         // BOOL - indicate if user support invitation code (for back competability support) 
exports.KParseUserInviteCodeKey         = "inviteCode";                    // NSString
exports.KParseUserInviteCodeDateKey     = "inviteCodeDate";                // Date



// Specifics that we have for facebook users

exports.KParseUserFacebookGenderKey       = "gender";          // NSString (male or female)
exports.KParseUserFacebookIDKey           = "facebookid";      // NSString  , example 10153290580504210
exports.KParseUserFacebookLinkAppKey      = "link";            // NSString  , exmaple - https://www.facebook.com/app_scoped_user_id/10153290580504210/
exports.KParseUserFacebookLocaleKey       = "locale";          // NSString  , example "en_US"
exports.KParseUserFacebookTimeZoneKey     = "timezone";        // NSString  , example "-7"
exports.KParseUserFacebookUpdatedTimeKey  = "updated_time";    // NSString  , example "2012-10-14T15:30:18+0000"
exports.KParseUserFacebookVerfiedKey      = "FacebookVerified";// NSNumber  , example 1
exports.KParseUserFacebookAgeMinKey       = "age_range_min";   // NSNumber  , example The lower bounds of the range for this person's age. enum{13, 18, 21}
exports.KParseUserFacebookAgeMaxKey       = "age_range_max";   // NSNumber  , example The lower bounds of the range for this person's age. The upper bounds of the range for this person's age. enum{17, 20, or empty}.
exports.KParseUserFacebookUserPhotoUrlKey = "user_photo_url";   // NSNumber  , example The lower bounds of the range for this person's age. The upper bounds of the range for this person's age. enum{17, 20, or empty}.


// Specifics for business owner
exports.KParseUserBusinessOwnerKey       = "business";         // BOOL      NO - end user, YES - store owner
exports.KParseUserRestaurantKey          = "restaurant";       // Pointer for PFObject of class Restuarant
exports.KParseUserSuspendKey             = "suspend";          // BOOL - indicate that the account is suspended 



/*************************************/
// Parse Parse.Installtion class keys
/*************************************/

exports.KParseInstallationUserKey            = "user";             // PFObject
exports.KParseInstallationLastSignedUserObjectIDKey            = "lastSignedUserID";             // PFObject

exports.KParseInstallationLocationKey        = "location";         // PFGeoPoint
exports.KParseInstallationLocationLatKey     = "locationLAT";      // NSNumber
exports.KParseInstallationLocationLongKey    = "locationLONG";     // NSNumber

exports.KParseInstallationDistanceFromBostonCICKey   = "DistanceBostonCIC";           // NSNumber
exports.KParseInstallationDistanceFromNYSOHOKey      = "DistanceNYSOHO";              // NSNumber
exports.KParseInstallationDistanceNYSouthCentralPark = "DistanceNYSouthCentralPark";  // NSNumber

exports.KParseInstallationLastTimeAppRunKey       = "lastTimeAppRun";      // NSDate

exports.KParseInstallationLocTimeKey         = "locTime";          // NSDate
exports.KParseInstallationSpeedKey           = "speed";            // NSNumber
exports.KParseInstallationLocDistTravelKey   = "locDistTravel";      // NSNumber
exports.KParseInstallationLocAccuracy        = "locAccuracy";      // NSNumber

exports.KParseInstallationVersion            = "GoPapayaVer";      // NSString
exports.KParseInstallationInternalVersion    = "GoPapayaInternalVer";      // NSString
exports.KParseInstallationDeviceModel        = "DeviceType";       // NSString   - Do not chnage name as iOS mVersion share this name
exports.KParseInstallationManufacturer       = "Manufacturer";     // NSString
exports.KParseInstallationDeviceMarket       = "MarketName";       // NSString
exports.KParseInstallationDeviceName         = "DeviceName";       // NSString

exports.KParseInstallationOSCodeName         = "Android_CODENAME";     // NSString
exports.KParseInstallationOSIncrimental      = "Android_INCREMENTAL";  // NSString
exports.KParseInstallationOSRelease          = "Android_RELEASE";      // NSString
exports.KParseInstallationOSSDKInt           = "Android_SDK_INT";      // Number

exports.KParseInstallationBLESupport         = "Android_BLE_Support";  // NSString

exports.KParseInstallationVendorUUID         = "VendorUUID";       // NSString

exports.KParseInstallationUserFirstName      = "userFirstName";        // NSString
exports.KParseInstallationUserLastName       = "userLastName";         // NSString
exports.KParseInstallationUserEmail          = "userEmail";        // NSString
exports.KParseInstallationRestaurantName     = "restaurantName";   // NSString
exports.KParseInstallationRestaurantEmail    = "restaurantEmail";  // NSString

exports.KParseInstallationNotificationTurnOff = "notifyTurnOff";       // BOOL

exports.KParseInstallationSessionCount        = "sessionCount";       // NSNumber


/****************************************/
// Parse Parse.InstallHistory class keys
/****************************************/

exports.KParseInstallHistoryClass            = "InstallHistory";

exports.KParseInstallHistoryDeviceTokenKey    = "deviceToken";        // NSString
exports.KParseInstallHistorySrcInstallationId = "SrcInstallID";       // NSString

exports.KParseInstallHistoryUserObjectIDKey     = "userObjectID";      // NSString

exports.KParseInstallHistoryInstallObjectIdKey  = "InstallObjectID";   // NSString


/****************************************/
// Parse Restaurant class keys
/****************************************/

exports.KParseRestaurantClass                  = "Restaurant";

exports.KParseRestaurantMaxImageCount         = 20;

exports.KParseRestaurantNameKey                = "name";               // NSString
exports.KParseRestaurantAddressAKey            = "address";            // NSString
exports.KParseRestaurantCityKey                = "city";               // NSString
exports.KParseRestaurantStateKey               = "state";              // NSString
exports.KParseRestaurantCountryKey             = "country";            // NSString
exports.KParseRestaurantPhoneKey               = "phone";              // NSString
exports.KParseRestaurantEmailKey               = "email";              // NSString
exports.KParseRestaurantPriceRatingKey         = "priceRating";        // NSNumber       1-4 $$$$
exports.KParseRestaurantAttireKey              = "attire";             // NSString
exports.KParseRestaurantPriceKey               = "price";              // NSString  (like $40 or more)
exports.KParseRestaurantNeighborhoodKey        = "neighborhood";       // NSString
exports.KParseRestaurantWebSiteKey             = "website";            // NSString
exports.KParseRestaurantMenuKey                = "menusite";           // NSString
exports.KParseRestaurantAboutKey               = "about";              // NSString
exports.KParseRestaurantParkingKey             = "parking";            // BOOL      0 - No valet parking, 1 - valet parking
exports.KParseRestaurantCreditKey              = "credit";             // BOOL      0 - cash only, 1 - credit card accepted
exports.KParseRestaurantPhotoKey               = "photo";              // PFFILE
exports.KParseRestaurantCuisineKey             = "cuisine";            // Array of NSString
exports.KParseRestaurantCuisineShortKey        = "cuisineShort";       // Array single NSString for anayltics
exports.KParseRestaurantLocationKey            = "location";           // PFGeoPoint

exports.KParseRestaurantUUIDKey                 = "uuid";               // NSString Beacon's UUID number
exports.KParseRestaurantMajorKey                = "major";              // NSString Beacon's major number
exports.KParseRestaurantMinorKey                = "minor";              // NSString Beacon's minor number

exports.KParseRestaurantBeaconVendorNameKey     = "BeaconVendorName";     // NSString Beacon's vendor name
exports.KParseRestaurantBeaconIDKey             = "VendorBeaconUniqueID"; // NSString Beacon's vendor unique ID


// Restaurant attributes about confirm table resevations

exports.KParseRestaurantSMSArrayPhonesKey       = "newSMSArrayPhones";        // Array of SMS Phone number for SMS confirmation

exports.KParseRestaurantSMSHoldConfirmKey       = "SMSHoldConfirm";        // BOOL, 0 - Do No Send SMS confirm for hold , 1 - Send SMS confirm for hold
exports.KParseRestaurantSMSCancelConfirmKey     = "SMSCancelConfirm";      // BOOL, 0 - Do No Send SMS confirm for cancel , 1 - Send SMS confirm for cancel
exports.KParseRestaurantSMSCheckInConfirmKey    = "SMSCheckInConfirm";     // BOOL, 0 - Do No Send SMS confirm for checkin , 1 - Send SMS confirm for checkin
exports.KParseRestaurantSMSMissConfirmKey       = "SMSMissConfirm";        // BOOL, 0 - Do No Send SMS confirm a miss, 1 - Send SMS confirm for a miss

exports.KParseRestaurantNewConfirmEmailArrayKey = "newConfirmArrayEmail";  // NSString email for email conformations

exports.KParseRestaurantEmailHoldConfirmKey     = "emailHoldConfirm";      // BOOL, 0 - Do No Send email confirm for hold , 1 - Send email confirm for hold
exports.KParseRestaurantEmailCancelConfirmKey   = "emailCancelConfirm";    // BOOL, 0 - Do No Send email confirm for cancel , 1 - Send email confirm for cancel
exports.KParseRestaurantEmailCheckInConfirmKey  = "emailCheckInConfirm";   // BOOL, 0 - Do No Send email confirm for checkin , 1 - Send email confirm for checkin
exports.KParseRestaurantEmailMissConfirmKey     = "emailMissConfirm";      // BOOL, 0 - Do No Send email confirm for miss , 1 - Send email confirm for miss

exports.ParseRestaurantVoiceSMSArrayPhonesKey   = "newVoiceSMSArrayPhones";   // Array of SMS Phone number for SMS confirmation

exports.KParseRestaurantVoiceSMSHoldConfirmKey    = "VoiceSMSHoldConfirm";     // BOOL, 0 - Do No Send SMS confirm for hold , 1 - Send SMS confirm for hold
exports.KParseRestaurantVoiceSMSCancelConfirmKey  = "VoiceSMSCancelConfirm";   // BOOL, 0 - Do No Send SMS confirm for cancel , 1 - Send SMS confirm for cancel
exports.KParseRestaurantVoiceSMSCheckInConfirmKey = "VoiceSMSCheckInConfirm";  // BOOL, 0 - Do No Send SMS confirm for checkin , 1 - Send SMS confirm for checkin
exports.KParseRestaurantVoiceSMSMissConfirmKey    = "VoiceSMSMissConfirm";     // BOOL, 0 - Do No Send SMS confirm a miss, 1 - Send SMS confirm for a miss


// Security/Fraud checks
exports.KParseRestaurantBeaconSecuirtyKey        = "beaconSecurity";        // BOOL should we look for the Beacon while doing changes to promotions
exports.KParseRestaurantGPSSecuirtyKey           = "GPSSecurity";           // BOOL should we look for the Beacon while doing changes to promotions

exports.KParseRestaurantBeaconSecuirtyDistKey    = "beaconDistSecurity";    // NSnumber the distnace in meters for max beacon distance
exports.KParseRestaurantBeaconSecuirtyDistAgeKey = "beaconAgeSecurity";     // NSnumber the max age for consider the beacon valid reading
exports.KParseRestaurantGPSSecuirtyDistKey       = "GPSDistSecurity";       // NSnumber the distance in meters for max GPS distance
exports.KParseRestaurantGPSSecuirtyAgeKey        = "GPSageSecurity";        // NSnumber the max age for consider the GPS valid reading


exports.KParseRestaurantBlockTableSpilloverKey   = "BlockTablesSpillOver";   // NSnumber (BOOL) indicate if we allow table spillover

exports.KParseRestaurantBlockSingleGuestKey      = "BlockSingleGuest";       // NSnumber (BOOL) indicate if we allow table spill

exports.KParseRestaurantYelpBusinessIdKey        = "yelpBusinessID";         // The business yelp business ID
exports.KParseRestaurantYelpRatingKey            = "yelpRating";             // The business yelp rating
exports.KParseRestaurantZagatRatingKey           = "zagatRating";             // The business zagat rating

// Privilage user for testing
exports.KParseRestaurantTestKey 		         = "testRestaurant";          // BOOL - indicate that the this is a test restaurant


/****************************************/
// Parse Promotion class keys
/****************************************/

// Parse Promotion Class & keys
exports.KParsePromotionClass                  = "Promotion";

exports.KParsePromotionRestaurantKey          = "restaurant";           // PFObject
exports.KParsePromotionLocationKey            = "location";             // PFGeoPoint  - location of the resturant
    																	// Add location to to promotion due to parse limitation to query
    																	// on the 2nd subquero on place (GeoLocation)	

exports.KParsePromotiontMaxDiscountKey        = "maxDiscount";         // NSNumber

 exports.KParsePromotionMaxHoldTimeKey         = "maxHoldTime";           // NSNumber in seconds

exports.KParsePromotionStartTimeKey           = "startTime";           // NSDate
exports.KParsePromotionEndTimeKey             = "endTime";             // NSDate    - this is the end time when the promotion
 																	   //             was completed (may be different then original
    																   //             only in case of overlapping deals
exports.KParsePromotionOriginalEndTimeKey     = "OriginalEndTime";     // NSDate    - this is the original end time the promotion ends
exports.KParsePromotionTotalTables2Key        = "totalTables";         // NSNumber   -- Tables for 2

exports.KParsePromotionTotalTables4Key        = "totalTables4";         // NSNumber   -- Tables for 4

exports.KParsePromotionTotalTables5Key        = "totalTables5";         // NSNumber   -- Tables for 5

exports.KParsePromotionTotalTables6Key        = "totalTables6";         // NSNumber   -- Tables for 6


exports.KParsePromotionAlcoholIncludedKey     = "alcoholIncluded";     // BOOL
exports.KParsePromotionSpecialNotesKey        = "specialNotes";        // NSArray

exports.KParsePromotionCanceledKey            = "canceled";           // BOOL - The promotion was cancel prior it started

exports.KParsePromotionStoppedKey             = "stopped";            // BOOL - The promotion was stopped while it was active

exports.KParsePromotionTestUserKey            = "testUserCreate";     // BOOL - The promotion was created by test user

exports.KParsePromotionBlockTableSpilloverKey = "BlockTablesSpillOver";   // NSnumber (BOOL) indicate if we allow table spillover

exports.KParsePromotionBlockSingleGuestKey    = "BlockSingleGuest";       // NSnumber (BOOL) indicate if we allow table spill

exports.KParsePromotionVersionKey               = "version";             // NSnumber- the schema mVersion of the promotion, at this time we do not support this field




/****************************************/
// Parse Session Viewing class keys
/****************************************/

exports.KParseSessionViewingClass               = "SessionViewing";

exports.KParseSessionViewingActivityTypeKey     = "activityType";          // NSString     -- The type of the activity - Viewing, Reserve, Cancel

// Viewing activity types

exports.KParseSessionNewView           = "NewSession";        // NSString
exports.KParseSessionViewingView       = "userViewing";       // NSString
exports.KParseSessionViewingReserve    = "userReserve";       // NSString
exports.KParseSessionViewingCancel     = "userCancel";        // NSString


// Extract from User object
exports.KParsSessionViewingFirstNameKey        = "firstname";        // NSString
exports.KParsSessionViewingLastNameKey         = "lastname";         // NSString
exports.KParsSessionViewingEmailKey            = "email";            // NSString
exports.KParsSessionViewingEmailVerifiedKey    = "EmailVerified";    // NSNumber
exports.KParsSessionViewingEmailScoreKey       = "emailScore";       // NSNumber

exports.KParsUserVeiewingPhoneNumberKey        = "phonenumber";      // NSString
exports.KParseSessionViewingInviteCodeKey      = "inviteCode";       // NSString

exports.KParseSessionViewingUserObjectIDKey    = "userObjectID";     // NSString

// Specifics for business owner
exports.KParseSessionViewingBusinessOwnerKey        = "business";         // BOOL      NO - end user, YES - store owner

// Privilage user for testing
exports.KParseSessionViewingTestUserKey             = "testUser";          // BOOL - indicate that the this is a test user

exports.KParseSessionViewingPromotionObjectIDKey    = "promotionObjectID";   //

exports.KParseSessionViewingRestaurantName     		= "ownerRestaurantName";   // NSString
exports.KParseSessionViewingRestaurantEmail     		= "ownerRestaurantEmail";   // NSString

exports.KParseSessionViewingAlcoholIncludedKey      = "alcoholIncluded";      // BOOL              // duplicate of the promotion info (we need to for the future miss to avoid going to the server
exports.KParseSessionViewingMaxDiscountKey          = "maxDiscount";          // NSNumber          // duplicate of the promotion info (we need to for the future miss to avoid going to the server

exports.KParseSessionViewingGroupSizeKey            = "group_size";            // NSNumber     -- The size of the group the customer asked for

exports.KParseSessionViewingLocationKey             = "user_locaton";                        // PFGeoPoint   -- The geo location where the record was created
exports.KParseSessionViewingLatLocKey               = "user_lat";                            // NSNumber     -- The lat location
exports.KParseSessionViewingLongLocKey              = "user_long";                           // NSNumber     -- The lat location
exports.KParseSessionViewingDistanceToRestaurantKey = "user_distance_restaurant";          // NSNumber - distance to restaurant

exports.KParseSessionViewingSpeedKey                = "speed";          // NSNumber -speed

exports.KParseSessionViewingDistanceFromBostonCICKey   = "DistanceBostonCIC";           // NSNumber
exports.KParseSessionViewingDistanceFromNYSOHOKey      = "DistanceNYSOHO";              // NSNumber
exports.KParseSessionViewingDistanceNYSouthCentralPark = "DistanceNYSouthCentralPark";  // NSNumber

exports.KParseSessionViewingDeviceVendorUUIDKey      = "device_UUID";          // NSString

exports.KParseSessionViewingRestaurantObjectIDKey  = "restObjectID";          // NSString - Object id of the restaurant object

exports.KParseSessionViewingRestaurantNameKey        = "rest_name";             // NSString
exports.KParseSessionViewingRestaurantShortCusineKey = "rest_cusine";           // NSArray
exports.KParseSessionViewingPriceRatingKey           = "priceRating";        // NSNumber       1-4 $$$$

exports.KParseSessionViewingRestaurantYelpRatingKey  = "rest_yelp_rating";      // NSNumber

exports.KParseSessionViewingRestaurantCityKey      = "rest_city";              // NSString  // duplicate of the restaurant object (make billing easier)
exports.KParseSessionViewingRestaurantStateKey     = "rest_state";             // NSString  // duplicate of the restaurant object (make billing easier)
exports.KParseSessionViewingRestaurantCountryKey   = "rest_country";           // NSString  // duplicate of the restaurant object (make billing easier)

exports.KParseSessionViewingRestaurantLatLocKey    = "rest_lat";                            // NSNumber     -- The lat location where checking happen
exports.KParseSessionViewingRestaurantLongLocKey   = "rest_long";                           // NSNumber     -- The lat location where checking happen

exports.KParseSessionViewingInstallationObjectIDKey  = "installationObjectID";          // NSString - Object id of the installation object

exports.KParseSessionViewingVersionKey             = "Version";         // NSNumber





