// Wire Master Writer
// by Nicholas Zambetti <http://www.zambetti.com>

// Demonstrates use of the Wire library
// Writes data to an I2C/TWI slave device
// Refer to the "Wire Slave Receiver" example for use with this

// Created 29 March 2006

// This example code is in the public domain.


#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_LSM303_U.h>

Adafruit_LSM303_Mag_Unified mag = Adafruit_LSM303_Mag_Unified(12345);
Adafruit_LSM303_Accel_Unified accel = Adafruit_LSM303_Accel_Unified(54321);

String direction = "";
int dir;
bool cond = false;

void setup() {
  Wire.begin(); // join i2c bus (address optional for master)
  #ifndef ESP8266
    while (!Serial);     // will pause Zero, Leonardo, etc until serial console opens
  #endif
  Serial.begin(9600);
  Serial.println("Magnetometer Test"); Serial.println("");
  
  /* Initialise the sensor */
  if(!mag.begin())
  {
    /* There was a problem detecting the LSM303 ... check your connections */
    Serial.println("Ooops, no LSM303 detected ... Check your wiring!");
    while(1);
  }

  if(!accel.begin())
  {
    /* There was a problem detecting the ADXL345 ... check your connections */
    Serial.println("Ooops, no LSM303 detected ... Check your wiring!");
    while(1);
  }
}

byte x = 0;

void loop() {
        sensors_event_t event; 
        mag.getEvent(&event);
        
        float Pi = 3.14159;
        
        // Calculate the angle of the vector y,x
        float heading = (atan2(-event.magnetic.z,-event.magnetic.y) * 180) / Pi;
        
        // Normalize to 0-360
        if (heading < 0)
        {
          heading = 360 + heading;
        }

        accel.getEvent(&event);

        //Readings from Database
//          String temp = "19.27325.3";
//          String altitude = temp.substring(0,5);
//          int ialt = altitude.toInt();
//          String azimuth = temp.substring(5);
//          int iaz = azimuth.toInt();

          //String temp = "19.27325.3";
          //String altitude = 19.27;
          //String azimuth = temp.substring(5);
          
          int ialt = 30.4783;
          int iaz = 229.781;
          

        //Readings from LSM303
          const double radians = 57.2958;
          float alt = atan2(event.acceleration.y,event.acceleration.x);
          alt = -alt * radians;
          
          Serial.println("--------------------------------");
          Serial.print("Altitude: ");
          Serial.println(ialt);
          Serial.print("Alt reading: ");
          Serial.println(alt);
          Serial.print("Azimuth: ");
          Serial.println(iaz);
          Serial.print("Az reading: ");
          Serial.println(heading);
          Serial.println("--------------------------------");
          
        //Compare database to LSM303 Readings
           int maxaz = heading + 20;
           int minaz = heading - 20;
           int maxalt = alt + 5;
           int minalt = alt - 5;

           if (iaz > maxaz && iaz <= 360) {
            direction = "right";
            dir = 1;
            Wire.beginTransmission(8); // transmit to device #8
            Wire.write(dir);        // sends five bytes
            Wire.endTransmission();    // stop transmitting
           } else if (iaz <= maxaz && iaz >= minaz) {
            direction = "azfound";
            cond = true;
            dir = 5;
            Wire.beginTransmission(8); // transmit to device #8
            Wire.write(dir);        // sends five bytes
            Wire.endTransmission();    // stop transmitting
           } else if (iaz < minaz) {
            direction = "left";
            dir = 2;
            Wire.beginTransmission(8); // transmit to device #8
            Wire.write(dir);        // sends five bytes
            Wire.endTransmission();    // stop transmitting
           } else if (iaz < minaz && iaz <= 360) {
            direction = "left";
            dir = 2;
            Wire.beginTransmission(8); // transmit to device #8
            Wire.write(dir);        // sends five bytes
            Wire.endTransmission();    // stop transmitting
           }

           if (cond == true) {
            if (ialt > maxalt) {
              direction = "up";
              dir = 4;
              Wire.beginTransmission(8); // transmit to device #8
              Wire.write(dir);        // sends five bytes
              Wire.endTransmission();    // stop transmitting
            } else if (ialt <= maxalt && ialt >= minalt) {
              direction = "altfound";
              dir = 6;
              Wire.beginTransmission(8); // transmit to device #8
              Wire.write(dir);        // sends five bytes
              Wire.endTransmission();    // stop transmitting
            } else if (ialt < minalt) {
              direction = "down";
              dir = 3;
              Wire.beginTransmission(8); // transmit to device #8
              Wire.write(dir);        // sends five bytes
              Wire.endTransmission();    // stop transmitting
            }
          } 
      
        delay(5000); 
}
