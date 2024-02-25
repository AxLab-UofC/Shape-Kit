abstract class Animation {
   boolean loaded;
   int[][] pinValues;
  
   Animation() {
     
   }
   
   void load() {
     loaded = true;
   }
   
   abstract void update();
}

//int[][] ripples(int t) {
//  int[][] vals = new int[25][25];
  
//  for (int i = 0; i < 25; i++) {
//      for (int j = 0; i < 25; i++) {
//        vals[i][j] = sin(sqrt(pow(i, 2) + pow(j, 2)) - ())
//    }
//  }
  
//  return vals;
//}
