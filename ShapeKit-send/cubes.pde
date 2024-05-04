import java.io.File;

int cols = 5;
int rows = 5;
float[][] cubeHeights = new float[cols][rows];
float cubeWidth = 100*ratio;
float cubeDepth = 100*ratio;
float initialHeight = 100*ratio;
float spacing = 110*ratio; // Spacing between cubes
boolean[][] keyActive = new boolean[cols][rows];

int blinkInterval = 30; // Duration for blinking effect (in frames)
int lastBlinkTime = 0; // Store the last time the light blinked


PGraphics setupCubes(){
	PGraphics scene3D = createGraphics(int(1000*ratio), int(1000*ratio), P3D);
	// Initialize all cube heigerehts
	for (int i = 0; i < cols; i++) {
		for (int j = 0; j < rows; j++) {
			cubeHeights[i][j] = initialHeight;
			keyActive[i][j] = false;
		}
	}
	return scene3D;
}

void draw3DScene(PGraphics scene3D){
	scene3D.beginDraw();
	scene3D.background(255);
	scene3D.lights();
	scene3D.ambientLight(60, 60, 60);
	scene3D.directionalLight(255, 255, 255, 0.5, 0, -1);
	//scene3D.pointLight(255, 255, 255, scene3D.width/2, scene3D.height/2, 250);
	scene3D.translate(scene3D.width / 2, scene3D.height / 2);
	scene3D.rotateX(QUARTER_PI);
	scene3D.rotateZ(QUARTER_PI);

	scene3D.fill(232, 216, 55);
	scene3D.stroke(232, 216, 55);

	//lights(); // Basic lighting
	//// Translate to center and rotate for 45-degree side view
	//translate(width / 2, height / 2);
	////rotateY(QUARTER_PI); // Rotate 45 degrees around the Y-axis
	//rotateX(QUARTER_PI); // Slight rotation around the X-axis for better perspective
	//rotateZ(QUARTER_PI);

	// Calculate starting position
	float startX = -rows * spacing / 2;
	float startY = -cols * spacing / 2;

	// Draw the cubes
	if (isPlaying) {
		drawPlayingCubes(startX, startY);
	}
	else if (isRemixing) {
		drawRemixingCubes(startX, startY);
	}
	else if (isSyncing) {
		drawSyncCubes(startX, startY);
	}
	else {
		drawLiveCubes(startX, startY);
	}

	// Draw the recording indicator
	drawRecordingIndicator();
	drawPlayingIndicator();
	
	scene3D.endDraw();

	image(scene3D, 100, height/10+30);

	// If being recorded, save the current heights
	if (isRecording) {
		recordHeights();
	}
}

void updateKeyState(char key, boolean state) {
	String keys = "1234567890qwertyuiopasdfg"; // Complete key sequence for all rows
	int index = keys.indexOf(key);
	if (index != -1) {
		int col = index % 5;
		int row = index / 5;
		if (state) {
			cubeHeights[row][col] += 10;
		}
		keyActive[row][col] = state;
		cubeHeights[row][col] = constrain(cubeHeights[row][col], initialHeight, 300); // Adjust this max value as needed
	}
}

void updateLiveHeights(int i, int j){
	// Interpolate height back to initialHeight if the key is not pressed
	if (!keyActive[i][j]) {
		cubeHeights[i][j] = lerp(cubeHeights[i][j], initialHeight, 0.1);
	}
}

void drawLiveCubes(float startX, float startY) {
	for (int i = 0; i < rows; i++) {
		for (int j = 0; j < cols; j++) {
			updateLiveHeights(i, j);
			scene3D.pushMatrix(); // Save the current transformation matrix
			scene3D.translate(startX + i * spacing, startY + j * spacing, cubeHeights[i][j] / 2); // Position cube based on height
			scene3D.box(cubeWidth, cubeWidth, cubeHeights[i][j]); // Draw the box with height along z-axis
			scene3D.popMatrix(); // Restore the original transformation matrix
		}
	}
}
