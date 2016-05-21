//packages:
// Iron Router
// accounts-password
// Restivus


// DataColl a Collection to hold the data value
// Meteor prefers to keep values in a Collection rather than a single variable. 
// This also allows us to store multiple values in a single location if we choose

DataColl = new Mongo.Collection('datastore'); //Initialize the collection
constellationData = new Mongo.Collection('constellationData');
val0=54; //Initial value for data
time0 = new Date().getTime(); // Adding a time value. Not strictly necessary, but useful.


if (Meteor.isServer) {
  Meteor.startup(function () {
  // Clears the Collection on startup, then inserts initial value in
	DataColl.remove({}); 
	DataColl.insert(   {value: val0, timestamp: time0}   ); 
	
  });
}


//Template Helpers
if (Meteor.isClient) {	   
	   Template.inputData.events({
			'submit form': function(event){ //Form submission
			  event.preventDefault();
			  //the value submitted in the form
			  var valForm = event.target.constellation.value;
              console.log("Constellation: "+valForm);
              var conname = constellationData.findOne({name:valForm});
              var rightAsc = conname.ra;
              var decl = conname.dec;
              var data = getCalculations(rightAsc, decl);
			  //Find the ID value of the item in the collection, then overwrite 
			  // its value with the new value
			  DataID = DataColl.findOne()._id;
			  DataColl.update(DataID ,{$set: {value: data} });
			}
		});
	    
		//Data display template helper functions
		Template.dataTemp.helpers({
			// Find the latest (and only, if code is unmodified) value in the collection and returns it
			'lastVal' : function () {
				valRead = DataColl.findOne({},{sort: {timestamp: -1}}  ).value;
				return valRead ;
			}
		});  
   }
   
//Extra functions needed for calculations
function radtodeg (num) {
    var num = num * (180/Math.PI);
    return num;
}

function degtorad (num) {
    var num = num * (Math.PI/180);
    return num;
}

function getCalculations(rightAsc, decl) {
    //Define all variables
    var origLong = -118.160908;
    var longtitude = degtorad(origLong);
    var latitude = 34.160908;
    latitude = degtorad(latitude);
    var d = new Date();
    var hours = d.getHours();
    console.log("Hours: "+hours);
    var minutes = d.getMinutes();
    minutes = minutes/60;
    console.log("Minutes: "+minutes);
    var UT = hours+minutes;
    console.log("UT: "+UT);
    var RA = rightAsc;
    var Dec = decl;
    Dec = degtorad(Dec);
    var date = null;

    //Step 1: Convert all measurements to degree format

    //Step 2: Find current time based on J2000
    var frac = UT/24;
    var daysUntil = /*get number from database*/121;
    var day = /*get day from date*/d.getDate();
    console.log("Day: "+day);
    var daysSince = /*get number from database*/5842.5;
    var TBJ = frac + daysUntil + day + daysSince;

    //Step 3: Calculate Local Siderial Time
    var LST = 100.46+(.985647*TBJ)+origLong+(15*UT);
    if (LST < 0) {
        while (LST < 0) {
            LST = LST + 360;
        }
    } else if (LST > 360) {
        while (LST > 360) {
            LST = LST - 360;
        }
    }
    console.log("LST: "+LST);

    //Step 4: Calculuate Hour Angle
    var HA = LST - (RA * 15);
    HA = degtorad(HA);

    //Step 5: Convert HA/Dec to Alt/Az
    var Alt = null;
    var sinDec = Math.sin(Dec); 
    var sinLat = Math.sin(latitude);
    var cosDec = Math.cos(Dec);
    var cosLat = Math.cos(latitude);
    var cosHA = Math.cos(HA);
    var sinHA = Math.sin(HA);

    console.log("sinDec: "+sinDec);
    console.log("sinlat: "+sinLat);
    console.log("cosDec: "+cosDec);
    console.log("cosLat: "+cosLat);
    console.log("cosHA: "+cosHA);
    console.log("sinHa: "+sinHA);
    Alt = sinDec*sinLat;
    Alt = Alt + cosDec*cosLat*cosHA;
    Alt = Math.asin(Alt);
    Alt = radtodeg(Alt);

    var sinAlt = Math.sin(degtorad(Alt));
    var cosAlt = Math.cos(degtorad(Alt));

    var Az = null;
    Az = ((sinDec-(sinAlt*sinLat))/(cosAlt*cosLat));
    Az = Math.acos(Az);
    Az = radtodeg(Az);
    if (sinHA < 0) {
        //Leave Az alone
    } else if (sinHA > 0) {
        Az = 360 - Az;
    }
    console.log("Alt: "+Alt);
    console.log("Az: "+Az);
    
    var cAlt = Alt.toString();
    cAlt = cAlt.substr(0,5);
    var cAz = Az.toString();
    console.log("cAlt: "+cAlt);
    cAz = cAz.substr(0,5);
    console.log("cAz: "+cAz);
    var combo = cAlt + cAz;
    console.log("Combo: "+combo)
    return combo;
}

 //If the URL is root, displays the input form
Router.route('/', function () {
		this.layout('inputData', {  });

	});
 

 
//if the URL is /data, only displays the data for easy retrieval 
Router.route('/data', function () {
	  this.layout('dataTemp', { });


	});


	
	

// API commands
// Best to not modify this stuff.
if (Meteor.isServer) {

  // Global API configuration
  var Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true
  });

  Api.addCollection(Meteor.users, {
    excludedEndpoints: ['getAll', 'put'],
    routeOptions: {
      authRequired: false
    },
    endpoints: {
      post: {
        authRequired: false
      },
      delete: {
        roleRequired: 'admin'
      }
    }
  });

  // Maps to: /api/getDat
  // Calling root/api/getDat will return the value of the data in DataColl
  Api.addRoute('getDat', {authRequired: false}, {
    get: function () {
      return parseInt(DataColl.findOne({},{sort: {timestamp: -1}} ).value);
    }
  });

  
  
  // Maps to: /api/postDat
  // Calling root/api/postData/xxx will give the the data in DataColl a value of xxx
   Api.addRoute('postDat/:message', {}, {

        post: {
            action: function(){

                var response = null;
                var message = this.urlParams.message;

                if(message){
				
							var valP = message; // 
							DataID = DataColl.findOne()._id;
							DataColl.update(DataID ,{$set: {value: valP} });
				
				
				
                    console.log("Message received: " + message);
                    return {status: "success", data: message};
                } else {
                    console.log("Message empty...");
                    return {status: "fail", message: "Post not found"};
                }


                return;
            }
        }
    })


  
  
  
  
  
  
}
	
