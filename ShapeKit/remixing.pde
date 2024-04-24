ArrayList<float[]> remixingRecord = new ArrayList<float[]>();
ArrayList<float[]> remixedRecord = new ArrayList<float[]>();
String remixingFileName = "";

boolean isRemixing = false;
int remixFrameInd;

void _resetRemixing(){
	heightSlider.setValue(1.0);
	speedSlider.setValue(1.0);
	remixedRecord.clear();
	isRemixing = false;
}

void _saveRemixing() {
	if (remixedRecord.size() > 0){
		String fileName = fname_remixing.getText().isEmpty() ? 
			"remix_" + year() + nf(month(), 2) + nf(day(), 2) + "_" + nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2) + ".txt"
			: fname_remixing.getText();
		saveStrings(dataPath(fileName), convertRemixingsToStringArray());
		println("Saved remix to " + fileName);
		
		// Add file to list
		for (int i=0; i<lists.length; i++){
			lists[i].addItems(new String[]{fileName});
		}

		// Empty dram
		remixedRecord.clear();
	}
}

String[] convertRemixingsToStringArray() {
	String[] lines = new String[remixedRecord.size()];
	for (int i = 0; i<remixedRecord.size(); i++) {
		float[] heights = remixedRecord.get(i);
		lines[i] = join(str(heights), ", ");
	}
	return lines;
}

void _startRemixing() {
	// Clear the array before remixing
	remixedRecord.clear();

	// Read file into remixingRecord
	if (remixingFileName != selectedItemList[1]){
		remixingRecord.clear();
		remixedRecord.clear();
		remixingFileName = selectedItemList[1];
		readRecording(remixingFileName, remixingRecord);
	}

	float heightRatio = heightSlider.getValue();
	float speed = speedSlider.getValue();
	int length = int((remixingRecord.size() - 1) / speed) + 1;
	println("Remix with height " + heightRatio + " speed " + speed + " original size " + remixingRecord.size() + " into size " + length);

	// If size and speed doesn't change, copy remixingRecord and return immediately
	if (length == remixingRecord.size() && heightRatio == 1.0) {
		remixedRecord = new ArrayList<float[]>(remixingRecord);
		return;
	}

	// Otherwise, do linear interpolation
	remixedRecord.add(remixingRecord.get(0));
	for(int i=1; i<length-1; i++){
		float[] heights = new float[cols * rows];
		int floorInd = floor(i * speed);
		int ceilInd = ceil(i * speed);
		float[] floorArr = remixingRecord.get(floorInd);
		float[] ceilArr = remixingRecord.get(ceilInd);
		for(int j=0; j<cols*rows; j++) {
			heights[j] = heightRatio * (floorArr[j] + (ceilArr[j] - floorArr[j]) * (i*speed - (float)floorInd));
		}
		remixedRecord.add(heights);
	}
	remixedRecord.add(remixingRecord.get(remixingRecord.size()-1));
	println("remixed into size of "+remixedRecord.size());

	isRemixing = true;
	remixFrameInd = 0;
}

void updateRemixHeights(int i,int j) {
	cubeHeights[i][j] = remixedRecord.get(remixFrameInd)[i*rows + j];
}

void checkRemixingEnd() {
	if (isRemixing && remixFrameInd >= remixedRecord.size()) {
		isRemixing = false;
	}
}

void drawRemixingCubes(float startX, float startY) {
	for (int i = 0; i < rows; i++) {
		for (int j = 0; j < cols; j++) {
			updateRemixHeights(i, j);
			scene3D.pushMatrix(); // Save the current transformation matrix
			scene3D.translate(startX + i * spacing, startY + j * spacing, cubeHeights[i][j] / 2); // Position cube based on height
			scene3D.box(cubeWidth, cubeWidth, cubeHeights[i][j]); // Draw the box with height along z-axis
			scene3D.popMatrix(); // Restore the original transformation matrix
		}
	}
	remixFrameInd += 1;
	checkRemixingEnd();
}

