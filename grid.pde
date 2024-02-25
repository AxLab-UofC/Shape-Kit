class Pin {
  int pinHeight;
  
  
  Pin() {
    pinHeight = 0;
  }
  
  boolean set(int i) {
    if (i > 255) i = 255;
    boolean ret = (abs(pinHeight - i) > 5) ;
    pinHeight = i;
    return ret;
  }
  
  int get() {
    return pinHeight;
  }
}

class Grid {
  Pin[][] pins;
  int xSize;
  int ySize;
  
  Grid(int x, int y) {
    pins = new Pin[x][y];
    xSize = x;
    ySize = y;
    
    for (int i = 0; i < x; i++) {
      for (int j = 0; j < y; j++) {
        pins[i][j] = new Pin();
      }
    }
  }
  
  void setPin(int x, int y, int value) {
    int val = min(255, max(0, value));
    if (pins[x][y].set(val)) {
      String msg = str((y * xSize) + x) + " " + str(value);
      myPort.write(msg);
      println(msg);
    }
  }
  
  int getPin(int x, int y) {
    return pins[x][y].get();
  }
  
}
