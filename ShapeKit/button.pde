import java.io.File;
PFont buttonFont; // = createFont("Roboto", 16, true); // Create a custom font for the buttons

// Buttons on the default tab
void setDefaultButtons(ControlP5 cp5) {
	Button startSyncButton = cp5.addButton("startSync")
		.setPosition(width*3/4 - 350, height/2)
		.setSize(300, 50)
		.setLabel("Start synchronizing")
		.setColorBackground(color(255, 229, 24))  // Yellow background
		.setColorForeground(color(255, 220, 0))
		.setColorActive(color(255, 220, 0))  // Darker yellow when pressed
		.setColorLabel(color(0))  // Black text
		.setFont(buttonFont)  // Set the custom font
		.moveTo("default");

	startSyncButton.addCallback(new CallbackListener() {
		public void controlEvent(CallbackEvent event) {
			if (event.getAction() == ControlP5.ACTION_RELEASED && !isRecording) {
				println("start sync");
				_startSync();
			}
		}
	});


	Button stopSyncButton = cp5.addButton("endSync")
		.setPosition(width*3/4 + 50, height/2)
		.setSize(300, 50)
		.setLabel("End synchronizing")
		.setColorBackground(color(255, 229, 24))  // Yellow background
		.setColorForeground(color(255, 220, 0))
		.setColorActive(color(255, 220, 0))  // Darker yellow when pressed
		.setColorLabel(color(0))  // Black text
		.setFont(buttonFont)  // Set the custom font
		.moveTo("default");

	stopSyncButton.addCallback(new CallbackListener() {
		public void controlEvent(CallbackEvent event) {
			if (event.getAction() == ControlP5.ACTION_RELEASED && !isRecording) {
				println("end sync");
				_stopSync();
			}
		}
	});
}

// Buttons on the Record tab
void setRecordButtons(ControlP5 cp5) {
	Button startRecordingButton = cp5.addButton("startRecording")
		.setPosition(width*3/4 - 350, height*5/6)
		.setSize(300, 50)
		.setLabel("RDCORD")
		.setColorBackground(color(255, 229, 24))  // Yellow background
		.setColorForeground(color(255, 220, 0))
		.setColorActive(color(255, 220, 0))  // Darker yellow when pressed
		.setColorLabel(color(0))  // Black text
		.setFont(buttonFont)  // Set the custom font
		.moveTo("Recording");

	startRecordingButton.addCallback(new CallbackListener() {
		public void controlEvent(CallbackEvent event) {
			if (event.getAction() == ControlP5.ACTION_RELEASED && !isRecording) {
				println("start recording");
				_startRecording();
			}
		}
	});

	Button stopRecordingButton = cp5.addButton("stopRecording")
		.setPosition(width*3/4 + 50, height*5/6)
		.setSize(300, 50)
		.setLabel("STOP")
		.setColorBackground(color(255, 229, 24))  // Yellow background
		.setColorForeground(color(255, 220, 0))
		.setColorActive(color(255, 220, 0))  // Darker yellow when pressed
		.setColorLabel(color(0))  // Black text
		.setFont(buttonFont)  // Set the custom font
		.moveTo("Recording");

	stopRecordingButton.addCallback(new CallbackListener() {
		public void controlEvent(CallbackEvent event) {
			if (event.getAction() == ControlP5.ACTION_RELEASED && isRecording) {
				println("stop recording");
				_stopRecording();
			}
		}
	});

	Button playingRecordingButton = cp5.addButton("playRecording")
		.setPosition(width*3/4 - 120, height*3/4 - 125)
		.setSize(200, 40)
		.setLabel("PLAY")
		.setColorBackground(color(255,255,255))  // Yellow background
		.setColorForeground(color(255, 220, 0))
		.setColorActive(color(255, 220, 0))  // Darker yellow when pressed
		.setColorLabel(color(0))  // Black text
		.setFont(buttonFont)  // Set the custom font
		.moveTo("Recording");

	playingRecordingButton.addCallback(new CallbackListener() {
		public void controlEvent(CallbackEvent event) {
			if (event.getAction() == ControlP5.ACTION_RELEASED && !isPlaying) {
				println("start playing");
				_startPlaying();
			}
		}
	});

	Button deleteRecordingButton = cp5.addButton("deleteRecording")
		.setPosition(width*3/4 + 120, height*3/4 - 125)
		.setSize(200, 40)
		.setLabel("DELETE")
		.setColorBackground(color(255,255,255))  // Yellow background
		.setColorForeground(color(255, 220, 0))
		.setColorActive(color(255, 220, 0))  // Darker yellow when pressed
		.setColorLabel(color(0))  // Black text
		.setFont(buttonFont)  // Set the custom font
		.setValue(0)
		.moveTo("Recording");

	deleteRecordingButton.addCallback(new CallbackListener() {
		public void controlEvent(CallbackEvent event) {
			if (event.getAction() == ControlP5.ACTION_RELEASED && !selectedItemList[0].isEmpty()) {
				_deleteRecording();
			}
		}
	});
}

// Buttons on the Remixing tax
void setRemixingButtons(ControlP5 cp5) {
	Button resetRemixingButton = cp5.addButton("resetRemixing")
		.setPosition(width*3/4 - 350, height*5/6)
		.setSize(300, 50)
		.setLabel("RESET")
		.setColorBackground(color(255, 229, 24))  // Yellow background
		.setColorForeground(color(255, 220, 0))
		.setColorActive(color(255, 220, 0))  // Darker yellow when pressed
		.setColorLabel(color(0))  // Black text
		.setFont(buttonFont)  // Set the custom font
		.setValue(1.0)
		.moveTo("Remixing");

	resetRemixingButton.addCallback(new CallbackListener() {
		public void controlEvent(CallbackEvent event) {
			if (event.getAction() == ControlP5.ACTION_RELEASED) {
				println("Reset remixing parameters");
				_resetRemixing();
			}
		}
	});

	Button saveRemixingButton = cp5.addButton("saveRemixing")
		.setPosition(width*3/4 + 50, height*5/6)
		.setSize(300, 50)
		.setLabel("SAVE")
		.setColorBackground(color(255, 229, 24))  // Yellow background
		.setColorForeground(color(255, 220, 0))
		.setColorActive(color(255, 220, 0))  // Darker yellow when pressed
		.setColorLabel(color(0))  // Black text
		.setFont(buttonFont)  // Set the custom font
		.moveTo("Remixing");

	saveRemixingButton.addCallback(new CallbackListener() {
		public void controlEvent(CallbackEvent event) {
			if (event.getAction() == ControlP5.ACTION_RELEASED) {
				println("Save remixed file");
				_saveRemixing();
			}
		}
	});

	Button startRemixingButton = cp5.addButton("startRemixing")
		.setPosition(width*3/4 + 120, height*3/4 - 210)
		.setSize(210, 40)
		.setLabel("REMIX")
		.setColorBackground(color(255,255,255))  // Yellow background
		.setColorForeground(color(255, 220, 0))
		.setColorActive(color(255, 220, 0))  // Darker yellow when pressed
		.setColorLabel(color(0))  // Black text
		.setFont(buttonFont)  // Set the custom font
		.moveTo("Remixing");

	startRemixingButton.addCallback(new CallbackListener() {
		public void controlEvent(CallbackEvent event) {
			if (event.getAction() == ControlP5.ACTION_RELEASED && !selectedItemList[1].isEmpty()) {
				println("Start remixing");
				_startRemixing();
			}
		}
	});
}

// Buttons on the Playing tab
void setPlayingButtons(ControlP5 cp5) {
	// Buttons for controlling recording
	Button starPlayingButton = cp5.addButton("startPlaying")
		.setPosition(width*3/4 - 350, height*5/6)
		.setSize(300, 50)
		.setLabel("PLAY")
		.setColorBackground(color(255, 229, 24))  // Yellow background
		.setColorForeground(color(255, 220, 0))
		.setColorActive(color(255, 220, 0))  // Darker yellow when pressed
		.setColorLabel(color(0))  // Black text
		.setFont(buttonFont)  // Set the custom font
		.moveTo("Playing");

	starPlayingButton.addCallback(new CallbackListener() {
		public void controlEvent(CallbackEvent event) {
			if (event.getAction() == ControlP5.ACTION_RELEASED && !isPlaying) {
				println("start playing");
				_startPlaying();
			}
		}
	});

	Button stopPlayingButton = cp5.addButton("stopPlaying")
		.setPosition(width*3/4 + 50, height*5/6)
		.setSize(300, 50)
		.setLabel("STOP")
		.setColorBackground(color(255, 229, 24))  // Yellow background
		.setColorForeground(color(255, 220, 0))
		.setColorActive(color(255, 220, 0))  // Darker yellow when pressed
		.setColorLabel(color(0))  // Black text
		.setFont(buttonFont)  // Set the custom font
		.moveTo("Playing");

	stopPlayingButton.addCallback(new CallbackListener() {
		public void controlEvent(CallbackEvent event) {
			if (event.getAction() == ControlP5.ACTION_RELEASED && isPlaying) {
				println("stop playing");
				_stopPlaying();
			}
		}
	});
}

// On Recording tab, draw yellow backbround behind play and delete button
void drawButtonBackground() {
	if (activeTabIndex == 1){
		// Draw backbround behind play and delete button
		fill(255, 229, 24);
		noStroke();
		rect(width*3/4 - 350, height*3/4 - 140, 700, 70);
	}

	if (activeTabIndex == 2){
		// Draw backbround behind play and delete button
		fill(255, 229, 24);
		noStroke();
		rect(width*3/4 - 350, height*3/4 - 220, 700, 60);
	}
}
