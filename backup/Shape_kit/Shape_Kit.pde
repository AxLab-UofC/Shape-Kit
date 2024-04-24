import processing.serial.*;
Serial myPort;
int[] servoPositions = new int[16]; // Current servo positions
int[] targetPositions = new int[16]; // Target servo positions
boolean[] keyStatus = new boolean[16]; // Track the status (pressed/released) of each key
int barWidth; // Width of each bar in the bar chart
int screenSize = 500;
int squareSize = 100;
int gapSize = 10;
boolean heightUpdated = false;

void setup() {
  size(550, 550);
  println(Serial.list());
  myPort = new Serial(this, Serial.list()[2], 9600);
  for (int i = 0; i < servoPositions.length; i++) {
    servoPositions[i] = 100; // Initialize all servo positions to 100
    targetPositions[i] = 100; // Initialize all target positions to 100
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
      targetPositions[i] -= 20;
      heightUpdated = true;
    }
    if (servoPositions[i] < targetPositions[i]) {
      servoPositions[i] += min(40, targetPositions[i] - servoPositions[i]); // Move up more quickly
      heightUpdated = true;
    } else if (servoPositions[i] > targetPositions[i]) {
      servoPositions[i] -= min(20, servoPositions[i] - targetPositions[i]); // Move down more quickly
      heightUpdated = true;
    }
    //servoPositions[i] = targetPositions[i]; // Update current position to target position
    message.append(servoPositions[i]).append(","); // Append position to message
    // Visualize servo position
    push();
    float barHeight = map(servoPositions[i], 100, 400, 0, 255);
    stroke(252, 190, 3);
    fill(252, 190, 3, barHeight);
    square((i % 4) * (squareSize + gapSize) + 50, floor(i / 4) * (squareSize + gapSize) + 50, squareSize);
    pop();
  }////////////
  //myPort.write(message.toString() + "\n"); // Send consolidated message
  //print(message.toString() + "\n");
  if (heightUpdated) {
    myPort.write("<" + message.toString() + ">\n");
    
    heightUpdated = false;
  }
  //delay(10); // daniel added delay function
  
  myPort.clear();
}

void updateKeyStatus(boolean pressed) {
  int index = -1; // Default to an invalid index
  // Check for non-character keys with keyCode
  if (keyCode == BACKSPACE) {
    index = 0;
  } else if (keyCode == ENTER) {
    index = 12;
  } else if (keyCode == TAB) {
    index = 3;
  } else {
    
    // Check for character keys
    switch(key) {
    case '*':
      index = 1;
      break;
    case '/':
      index = 2;
      break;
    case '-':
      index = 4;
      break;
    case '9':
      index = 5;
      break;
    case '8':
      index = 6;
      break;
    case '7':
      index = 7;
      break;
    case '+':
      index = 8;
      break;
    case '6':
      index = 9;
      break;
    case '5':
      index = 10;
      break;
    case '4':
      index = 11;
      break;
    case '3':
      index = 13;
      break;
    case '2':
      index = 14;
      break;
    case '1':
      index = 15;
      break;
    }
  }
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
