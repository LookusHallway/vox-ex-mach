/*
  Author: Luke Hathaway
  arduino.ino

  Three-Motor Stepper Control with Y2 mirroring Y1 in opposite direction
  Serial commands:
    1st Byte: Contains instructions
    2nd and 3rd Bytes: Contains values
    4th Byte: Newline charactter
*/

#include <AccelStepper.h>

// defines pins numbers
#define ENAX 4     // Enable X
#define ENAY1 12    // Enable Y1
#define ENAY2 12   // Enable Y2

#define STEPX 2   // Step for top motor (x axis)
#define STEPY1 5  // Step for left motor (y axis)
#define STEPY2 10  // Step for right motor (y axis)
#define DIRX 3    // Direction for top motor (x axis)
#define DIRY1 6   // Direction for left motor (y axis)
#define DIRY2 11   // Direction for right motor (y axis)
#define LED_PIN 13 // On-board LED pin

AccelStepper stepperX(AccelStepper::DRIVER, STEPX, DIRX);
AccelStepper stepperY1(AccelStepper::DRIVER, STEPY1, DIRY1);
AccelStepper stepperY2(AccelStepper::DRIVER, STEPY2, DIRY2);

bool accel;
uint8_t instructionMask = 0b11000000;
uint8_t axisMask = 0b00100000;

/* Sets the motor's target to pos, considering that Y1 and Y2 move together */
void setPosition(uint8_t axis, uint16_t pos) {
  if (axis == 0) { // X axis
    stepperX.moveTo(pos);
    // Serial.println("X moving to " + String(pos));
  } else if (axis == 1) { // Y axis
    stepperY1.moveTo(pos);
    stepperY2.moveTo(pos);
    // Serial.println("Y1/Y2 moving to " + String(pos));
  } else {
    Serial.println("Invalid motor ID");
  }
}

/*
  Sets the motor's speed to sps, considering that Y1 and Y2 move together
*/
void setSpeed(uint8_t axis, uint16_t speed) {
  if (speed < 0 || speed > 8000) { // Hard limits to prevent hardware issues
    Serial.println("Speed must be between 0 and 8000");
    return;
  }

  if (axis == 0) { // X axis
    stepperX.setMaxSpeed(speed);
    // Serial.println("Set X speed to " + String(speed));
  } else if (axis == 1) { // Y axis
    stepperY1.setMaxSpeed(speed);
    stepperY2.setMaxSpeed(speed);
    // Serial.println("Set Y1/Y2 speed to " + String(speed));
  } else {
    Serial.println("Invalid motor ID");
  }
}

/* Processes the serial command */
void processCommand(uint8_t cmd, uint16_t value) {
  uint8_t instruction = (cmd & instructionMask) >> 6; // Instruction is the two most significant bits
  uint8_t axis = (cmd & axisMask) >> 5; // Axis is the third most significant bit

  switch (instruction) {
    case 0: // position
      setPosition(axis, value);
      break;
    case 1: // speed
      setSpeed(axis, value);
    case 2: // acceleration
      if (value == 0) accel = false;
      else accel = true;
      break;
    case 3: // stop
      break;
    default:
      Serial.println("Error: Unknown command.");
  }
  
}
void setup() {
  Serial.begin(115200);

  // Set enable pins
  stepperX.setEnablePin(ENAX);
  stepperY1.setEnablePin(ENAY1);
  stepperY2.setEnablePin(ENAY2);

  // Set pin inversions
  stepperX.setPinsInverted(false, false, true);
  stepperY1.setPinsInverted(false, false, true);
  stepperY2.setPinsInverted(true, false, true); // Invert the direction pin so that motors Y1 and Y2 are coordinated

  // Enables outputs
  stepperX.enableOutputs();
  stepperY1.enableOutputs();
  stepperY2.enableOutputs();

  // Zeros each stepper, TBD if we decide to calibrate it
  stepperX.setCurrentPosition(0);
  stepperY1.setCurrentPosition(0);
  stepperY2.setCurrentPosition(0);

  // With current hardware config, keep this because no electrical fires please
  stepperX.setMaxSpeed(6000);
  stepperY1.setMaxSpeed(6000);
  stepperY2.setMaxSpeed(6000);

  // Sets acceleration for each motor
  stepperX.setAcceleration(60000);
  stepperY1.setAcceleration(60000);
  stepperY2.setAcceleration(60000);


  // Sets LED pin
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  Serial.println("3-Motor Controller Ready.");
}

void loop() {
  if (Serial.available() >= 4) {
    uint8_t cmd = Serial.read(); // 4 most significant bits contain instructions
    uint8_t lsb = Serial.read(); // 8 least significant bits of value
    uint8_t msb = Serial.read(); // 8 most significant bits of value
    String nl = Serial.readStringUntil('\n');

    int16_t value = (int16_t) ((msb << 8) | lsb); // Combine the msb and lsb into one 16-bit integer
    processCommand(cmd, value);
  }

  if (accel) { // Runs with acceleration
    stepperX.run();
    stepperY1.run();
    stepperY2.run();
  } else { // Runs without acceleration (full speed all of the time)
    stepperX.setSpeed(stepperX.maxSpeed());
    stepperY1.setSpeed(stepperY1.maxSpeed());
    stepperY2.setSpeed(stepperY2.maxSpeed());
    stepperX.runSpeedToPosition();
    stepperY1.runSpeedToPosition();
    stepperY2.runSpeedToPosition();
  }
}