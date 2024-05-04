ArrayList<float[]> recordings = new ArrayList<float[]>();
boolean isRecording = false;

void _startRecording() {
	isRecording = true;
	recordings.clear(); // Clear previous recordings
}

void _stopRecording() {
	isRecording = false;
	String fileName = _saveRecording(); // Save the recorded data

	// Add file to list
	for (int i=0; i<lists.length; i++){
		lists[i].addItems(new String[]{fileName});
	}
}

void recordHeights() {
	float[] currentHeights = new float[cols * rows];
	int index = 0;
	for (int i = 0; i < rows; i++) {
		for (int j = 0; j < cols; j++) {
			currentHeights[index++] = cubeHeights[i][j];
		}
	}
	recordings.add(currentHeights);
}

String _saveRecording() {
	String fileName = fname_record.getText().isEmpty() ? 
		"record_" + year() + nf(month(), 2) + nf(day(), 2) + "_" + nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2) + ".txt"
		: fname_record.getText();
	saveStrings(dataPath(fileName), convertRecordingsToStringArray());
	println("Saved recording to " + fileName);
	return fileName;
}


String[] convertRecordingsToStringArray() {
	String[] lines = new String[recordings.size()];
	for (int i = 0; i<recordings.size(); i++) {
		float[] heights = recordings.get(i);
		lines[i] = join(str(heights), ", ");
	}
	return lines;
}

void _deleteRecording() {
	// Delete the selected item from the scrollable list
	println("deleting item " + selectedItemList[0]);
	for (int i=0; i<lists.length; i++){
		lists[i].removeItem(selectedItemList[0]);
	}
	File file = new File(dataPath(selectedItemList[0]));
	file.delete();

	// Reset selectedItemList
	if (selectedItemList[1] == selectedItemList[0]){
		selectedItemList[1] = "";
	}
	if (selectedItemList[2] == selectedItemList[0]){
		selectedItemList[2] = "";
	}
	selectedItemList[0] = "";
}

// Draw the indicator for being recording at the upper left corner
void drawRecordingIndicator() {
	if (activeTabIndex == 1){
		fill(isRecording ? color(255, 52, 25) : color(128)); // Red if recording, grey if not
		if (isRecording && (frameCount - lastBlinkTime > blinkInterval)) {
			// Update last blink time and toggle visibility
			lastBlinkTime = frameCount;
		}
		if (!isRecording || frameCount % (2 * blinkInterval) < blinkInterval) {
			ellipse(85, height/10 + 30, 20, 20); // Position the indicator in the upper left corner
		}
	}
}