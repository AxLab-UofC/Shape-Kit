class RecordingCanvas extends Canvas {

  int bg_x;
  int bg_y;
  int bg_width;
  int bg_height;
  int mx = 0;
  int my = 0;
  public void setup(PGraphics pg) {
    pg.fill(0);
    bg_width = int(width * .4);
    bg_height = int(height * .5);
    bg_x = width/2 + (width/2 - bg_width) / 2;
    bg_y = (height - bg_height)/2;
    
  }  

  public void update(PApplet p) {
  }

  public void draw(PGraphics pg) {
    // renders a square with randomly changing colors
    // make changes here.
    pg.rect(bg_x,bg_y,bg_width,bg_height);
  }
}
