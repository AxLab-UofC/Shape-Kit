import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

ArrayList<float[]> playingRecord = new ArrayList<float[]>();
boolean isPlaying = false;
int playingFrameInd = 0;
String playingFileName = "";

void drawPlayingHeights(){
	if (playingFrameInd >= playingRecord.size()) {
		_stopPlaying();
	}
	else {
		// Calculate starting position
		float startX = -cols * spacing / 2;
		float startY = -rows * spacing / 2;

		for (int i = 0; i < cols; i++) {
			// Draw the cubes
			for (int j = 0; j < rows; j++) {
				cubeHeights[i][j] = playingRecord.get(playingFrameInd)[i*rows + j];
				scene3D.pushMatrix(); // Save the current transformation matrix
				scene3D.translate(startX + i * spacing, startY + j * spacing, cubeHeights[i][j] / 2); // Position cube based on height
				scene3D.box(cubeWidth, cubeWidth, cubeHeights[i][j]); // Draw the box with height along z-axis
				scene3D.popMatrix(); // Restore the original transformation matrix
			}
		}
		playingFrameInd += 1;
	}
}

void updatePlayingHeights(int i, int j){
	cubeHeights[i][j] = playingRecord.get(playingFrameInd)[i*rows + j];
}

void readRecording(String fileName, ArrayList<float[]> recoding){
    try (BufferedReader reader = new BufferedReader(new FileReader(dataPath(fileName)))) {
        String line;
        while ((line = reader.readLine()) != null) {
            String[] values = line.split(","); // Split the line by comma
            float[] floatArray = new float[values.length];
            for (int i = 0; i < values.length; i++) {
                floatArray[i] = Float.parseFloat(values[i]); // Parse each value to float
            }
            recoding.add(floatArray); // Add the float array to the ArrayList
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
}

// Draw the indicator for being playing at the upper left corner
void drawPlayingIndicator() {
	if (activeTabIndex == 1 || activeTabIndex == 3){
		strokeWeight(5);
		fill(isPlaying ? color(255, 52, 25) : color(128)); // Red if recording, grey if not

		if (isPlaying && (frameCount - lastBlinkTime > blinkInterval)) {
			// Update last blink time and toggle visibility
			lastBlinkTime = frameCount;
		}
		if (!isPlaying || frameCount % (2 * blinkInterval) < blinkInterval) {
			triangle(75, height/10 + 60, 75, height/10 + 80, 95, height/10 + 70); // Position the indicator in the upper right corner
		}
	}
}

void _startPlaying() {
	isPlaying = true;
	if (playingFileName != selectedItemList[activeTabIndex-1]){
		playingRecord.clear();
		playingFileName = selectedItemList[activeTabIndex-1];
		readRecording(playingFileName, playingRecord);
	}
	playingFrameInd = 0;
}

void _stopPlaying() {
	isPlaying = false;
}

void checkPlayingEnd() {
	if (isPlaying && playingFrameInd >= playingRecord.size()) {
		_stopPlaying();
	}
}

void drawPlayingCubes(float startX, float startY) {
	for (int i = 0; i < rows; i++) {
		for (int j = 0; j < cols; j++) {
			updatePlayingHeights(i, j);
			scene3D.pushMatrix(); // Save the current transformation matrix
			scene3D.translate(startX + i * spacing, startY + j * spacing, cubeHeights[i][j] / 2); // Position cube based on height
			scene3D.box(cubeWidth, cubeWidth, cubeHeights[i][j]); // Draw the box with height along z-axis
			scene3D.popMatrix(); // Restore the original transformation matrix
		}
	}
	playingFrameInd += 1;
	checkPlayingEnd();
}
