#include <Adafruit_PWMServoDriver.h>
#include <Wire.h>

Adafruit_PWMServoDriver pwm1 = Adafruit_PWMServoDriver(0x40);
Adafruit_PWMServoDriver pwm2 = Adafruit_PWMServoDriver(0x41);

#define SERVOMIN 130
#define SERVOMAX 480

#define SERVO_FREQ 60

int lastValue[25];
boolean valueUpated = false;

void setup() {
  Serial.begin(57600);
  pwm1.begin();
  pwm1.setOscillatorFrequency(27000000);
  pwm1.setPWMFreq(SERVO_FREQ);  // Analog servos run at ~50 Hz updates

  pwm2.begin();
  pwm2.setOscillatorFrequency(27000000);
  pwm2.setPWMFreq(SERVO_FREQ);  // Analog servos run at ~50 Hz updates
  delay(10);

  for (int num = 0; num < 25; num++) {
    lastValue[num] = SERVOMAX;
    if (num < 16) {
      pwm1.setPWM(num, 0, SERVOMAX);
    }
    else if (num >= 16 && num < 25) {
      pwm2.setPWM(num - 16, 0, SERVOMAX);
    }
  }

}


void loop() {
  static boolean receiving = false;
  static String data = "";

  while (Serial.available()) {
    char c = Serial.read();
    if (c == '<') {
      data = "";
      receiving = true;
    } else if (c == '>' && receiving) {
      process(data);
      receiving = false;
    } else if (receiving) {
      data += c;
    }
  }
}

void process(String message) {
  int index = 0;
  int positions[25];
  for (int i = 0; i < 25; i ++) {
    int nextIndex = message.indexOf(',', index);
    if (nextIndex == -1) break;
    positions[i] = message.substring(index, nextIndex).toInt();
    index = nextIndex + 1;
    //int pulseLength = position[i];

    if (positions[i] != lastValue[i]){
      valueUpated = true;
    }
    
    

    if (positions[i] <= SERVOMAX && positions[i] >= SERVOMIN && valueUpated == true) {
      if (i < 16) {
        pwm1.setPWM(i, 0, positions[i]);
      } else if (i < 25) {
        pwm2.setPWM(i - 16, 0, positions[i]);
      }

    lastValue[i] = positions[i];
    valueUpated = false;
    }

//    lastValue[i] = positions[i];
//    valueUpated = false;

  }
}
