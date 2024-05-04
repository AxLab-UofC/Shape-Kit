
int SERVOMIN = 130;
int SERVOMAX = 480;
int heightMin = 78;
int heightMax = 300;
int frameMin = 100;
int frameMax = 145;
int scaledVal[];


void sendMessage(int[] values) {
  
  StringBuilder message = new StringBuilder();

  //scaledVal = map(values[i], frameMin, frameMax, SERVOMIN, SERVOMAX);
  for (int i = 0; i < values.length; i++){
    //scaledVal[i] = round(map(values[i], 0, 150, SERVOMIN, SERVOMAX));
    //scaledVal = (values[i] - frameMin) * ()
    //values[i] = SERVOMIN + (values[i] - frameMin) * (392/85);
    //message.append(round(values[i]) + 150).append(","); // Append position to message
    //message.append(round(map(values[i], 0, 150, SERVOMIN, SERVOMAX))).append(",");
    message.append(150+values[i]).append(",");
  }
  
  myPort.write("<" + message.toString() + ">\n");
  //println("<" + message.toString() + ">\n");
  
  myPort.clear();
}
    
