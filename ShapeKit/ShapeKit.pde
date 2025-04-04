import controlP5.*;
import oscP5.*;
import netP5.*;
import java.util.ArrayList;

OscP5 oscP5;
NetAddress[] server;
ControlP5 cp5;
PGraphics scene3D;
float ratio = 0.78;
float ratioHeight = 0.78;
void setup() {
	//launch OSC sercer
	oscP5 = new OscP5(this, 3333);
	server = new NetAddress[1];
	server[0] = new NetAddress("127.0.0.1", 3334);

//size(displayWidth, displayHeight);

	//size(1920, 1080, P2D);
  size(1512, 850, P2D);
  //surface.setResizable(true);
  //fullScreen();
	smooth(4);
	frameRate(60); 

	// Initialize 3d scene of cubes
	scene3D = setupCubes();

	// Initialize control
	cp5 = setupControl();

}

void draw() {
	// Set backgound white
	background(255);
  //scale(0.7);
	// Draw 3D cubes
	draw3DScene(scene3D);

	// Draw 2D interface elements over the 3D scene
	draw2DInterface(cp5);
	// Draw supporting for controls
	drawButtonBackground();
	drawTextFieldBackground();
	drawTabs();
	// println("Selected item: " + selectedItem);

}


void keyPressed() {
	updateKeyState(key, true);
}

void keyReleased() {
	updateKeyState(key, false);
}
