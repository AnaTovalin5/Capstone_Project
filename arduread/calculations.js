//Define all variables
                var origLong = -1.916667;
                var longtitude = degtorad(origLong);
                var latitude = 52.5;
                latitude = degtorad(latitude);
                var UT = 23.166667;
                var RA = 16.695;
                var Dec = 36.466667;
                Dec = degtorad(Dec);
                var date = null;

                //Step 1: Convert all measurements to degree format

                //Step 2: Find current time based on J2000
                var frac = UT/24;
                var daysUntil = /*get number from database*/212;
                var day = /*get day from date*/10;
                var daysSince = /*get number from database*/-731.5;
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
                console.log("Az: "+Az);