#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_LSM303_U.h>

/* Assign a unique ID to this sensor at the same time */
Adafruit_LSM303_Mag_Unified mag = Adafruit_LSM303_Mag_Unified(12345);

String direction = "";

void setup(void) 
{
  Serial.begin(9600);
  Serial.println("Magnetometer Test"); Serial.println("");
  
  /* Initialise the sensor */
  if(!mag.begin())
  {
    /* There was a problem detecting the LSM303 ... check your connections */
    Serial.println("Ooops, no LSM303 detected ... Check your wiring!");
    while(1);
  }
}

void loop(void) 
{
  /* Get a new sensor event */ 
  sensors_event_t event; 
  mag.getEvent(&event);
  
  float Pi = 3.14159;
  
  // Calculate the angle of the vector y,x
  float heading = (atan2(-event.magnetic.z,-event.magnetic.y) * 180) / Pi;
  //float heading = (atan2(event.magnetic.y,event.magnetic.x) * 180) / Pi;
    
  // Normalize to 0-360
  if (heading < 0)
  {
    heading = 360 + heading;
  }

  if (heading >= 0 && heading < 30) {
    direction = "north";
  } else if (heading >= 30 && heading < 60) {
    direction = "north-east";
  } else if (heading >= 60 && heading < 120) {
    direction = "east";
  } else if (heading >= 120 && heading < 150) {
    direction = "south-east";
  } else if (heading >= 150 && heading < 210) {
    direction = "south";
  } else if (heading >= 210 && heading < 240) {
    direction = "south-west";
  } else if (heading >= 240 && heading < 300) {
    direction = "west";
  } else if (heading >= 300 && heading < 330) {
    direction = "north-west";
  } else if (heading >= 330) {
    direction = "north";
  }
  
  Serial.print("Compass Heading: ");
  Serial.print(heading);Serial.print(" ");Serial.println(direction);
  delay(2000);
}
