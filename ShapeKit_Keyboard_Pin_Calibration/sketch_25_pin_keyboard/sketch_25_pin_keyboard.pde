import processing.serial.*;

Serial myPort;
int[] servoPositions = new int[25]; // Current servo positions
int[] targetPositions = new int[25]; // Target servo positions
int[] sentPositions = new int[25];
boolean[] keyStatus = new boolean[25]; // Track the status (pressed/released) of each key
int barWidth; // Width of each bar in the bar chart

int screenSize = 500;
int squareSize = 100;
int gapSize = 10;

int SERVOMIN = 130;
int SERVOMAX = 480;

boolean heightUpdated = false;

void setup() {
  size(650, 650);
  println(Serial.list());
  myPort = new Serial(this, Serial.list()[2], 57600);
  for (int i = 0; i < servoPositions.length; i++) {
    servoPositions[i] = 100; // Initialize all servo positions to 100
    targetPositions[i] = 100; // Initialize all target positions to 100
    sentPositions[i] = 100;
  }
  barWidth = width / servoPositions.length;

  frameRate(30);
}

void draw() {
  background(255);

  //ellipse(mouseX, mouseY, 10, 10);

  StringBuilder message = new StringBuilder();
  for (int i = 0; i < servoPositions.length; i++) {
    if (keyStatus[i] && targetPositions[i] < 400) {
      targetPositions[i] += 40;
      heightUpdated = true;
    } else if (!keyStatus[i] && targetPositions[i] > 100) {
      targetPositions[i] -= 30;
      heightUpdated = true;
    }

    if (servoPositions[i] < targetPositions[i]) {
      servoPositions[i] += min(40, targetPositions[i] - servoPositions[i]); // Move up more quickly
      heightUpdated = true;
    } else if (servoPositions[i] > targetPositions[i]) {
      servoPositions[i] -= min(30, servoPositions[i] - targetPositions[i]); // Move down more quickly
      heightUpdated = true;
    }
    
    sentPositions[i] = round(map(servoPositions[i], 100, 500, SERVOMAX, SERVOMIN));
    
    if (sentPositions[i] > SERVOMAX){
      sentPositions[i] = SERVOMAX;
    } 
    
    if (sentPositions[i] < SERVOMIN){
      sentPositions[i] = SERVOMIN;
    }

    //servoPositions[i] = targetPositions[i]; // Update current position to target position

    message.append(sentPositions[i]).append(","); // Append position to message
    // Visualize servo position
    push();
    float barHeight = map(servoPositions[i], 100, 400, 0, 255);
    stroke(252, 190, 3);
    fill(252, 190, 3, barHeight);
    square((5 - (i % 5)) * (squareSize + gapSize) - 50, floor(i / 5) * (squareSize + gapSize) + 50, squareSize);
    pop();
  }////////////
    
  //  // Visualize servo position
  //  float barHeight = map(servoPositions[i], 100, 400, 0, height);
  //  fill(100, 100, 255);
  //  rect(i * barWidth, height - barHeight, barWidth - 5, barHeight);
  //}////////////
  //myPort.write(message.toString() + "\n"); // Send consolidated message
  //print(message.toString() + "\n");
  if (heightUpdated) {
    myPort.write("<" + message.toString() + ">\n");
    println("<" + message.toString() + ">\n");
    
    heightUpdated = false;
  }

  //delay(10); // daniel added delay function

  myPort.clear();
}

//void keyPressed() {
//  updateKeyStatus(key, true);
//}

//void keyReleased() {
//  updateKeyStatus(key, false);
//}

//void updateKeyStatus(char key, boolean pressed) {
//  String keys = "'TAB'/*'BACK'789-456+123'ENTER'";
//  //String keys = "1234567890qwertyuiopasdf"; // Extended for 16 keys
//  int index = keys.indexOf(key);
//  if (index != -1 && index < servoPositions.length) {
//    keyStatus[index] = pressed;
//  }
//}

void updateKeyStatus(boolean pressed) {
  int index = -1; // Default to an invalid index

  // Check for non-character keys with keyCode
  //if (keyCode == 7) {
  //  index = 0;
  //} else if (keyCode == M) {
  //  index = 12;
  //} else if (keyCode == 4) {
  //  index = 3;
  //} else {
    
    // Check for character keys
    switch(key) {
    case '`':
      index = 0;
      break;
    case '1':
      index = 1;
      break;
    case '2':
      index = 2;
      break;
    case '3':
      index = 3;
      break;
    case '4':
      index = 4;
      break;
    case '5':
      index = 5;
      break;
    case '6':
      index = 6;
      break;
    case '7':
      index = 7;
      break;
    case '8':
      index = 8;
      break;
    case '9':
      index = 9;
      break;
    case '0':
      index = 10;
      break;
    case 'q':
      index = 11;
      break;
    case 'w':
      index = 12;
      break;
    case 'e':
      index = 13;
      break;
    case 'r':
      index = 14;
      break;
    case 't':
      index = 15;
      break;
    case 'y':
      index = 16;
      break;
     case 'u':
      index = 17;
      break;
     case 'i':
      index = 18;
      break;
     case 'o':
      index = 19;
      break;
     case 'p':
      index = 20;
      break;
     case 'a':
      index = 21;
      break;
     case 's':
      index = 22;
      break; 
     case 'd':
      index = 23;
      break;
     case 'f':
      index = 24;
      break;
     
    }
 // }

  // Update the keyStatus array if a valid index was found
  if (index != -1) {
    keyStatus[index] = pressed;
  }
}

void keyPressed() {
  updateKeyStatus(true);
      
}

void keyReleased() {
  updateKeyStatus(false);
  heightUpdated = true;
}
