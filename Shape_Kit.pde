import processing.serial.*;
Serial myPort;

int screenSize = 500;
int squareSize = 50;
int gapSize = 10;

Grid grid;

void settings() {
  size(screenSize, screenSize, P2D);
}

void setup() {
  grid = new Grid(5, 5);
  String portName = Serial.list()[1];
  println(portName);
  myPort = new Serial(this, portName, 9600);
}

void draw() {
  background(200);
  
  pushMatrix();
  translate(50, 50);
   for (int i = 0; i < grid.xSize; i++) {
     for (int j = 0; j < grid.ySize; j++) {
       if (mousePressed) {
         grid.setPin(i, j, grid.getPin(i,j) + 2);
       } else {
         grid.setPin(i, j, grid.getPin(i,j) - 1);
       }
       
       
       push();
       fill(grid.getPin(i, j));
       square(i * (squareSize + gapSize), j * (squareSize + gapSize), squareSize);
       pop();
     }
   }
   popMatrix();
}

void mousePressed(){
  circle(mouseX, mouseY, 20);
   for (int i = 0; i < grid.xSize; i++) {
     for (int j = 0; j < grid.ySize; j++) {
       grid.setPin(i, j, grid.getPin(i,j) + 20);
     }
   }
   stroke(0, 0, 0, 0);
}
