Textfield fname_record;
Textfield fname_remixing;

void setTextField(ControlP5 cp5) {
	fname_record = cp5.addTextfield("nameRecording")
		.setLabel("")
		.setPosition(width*3/4 - 190*ratio, height*5/6 - 100*ratio)
		.setSize(int(540*ratio), int(40*ratio))
		.setFont(createFont("Arial", 20))
		.setColor(color(0))
		.setColorBackground(color(255))
		.setColorForeground(color(255, 229, 24))
		.setColorActive(color(255, 229, 24))
		.setColorCursor(color(0)) 
		.setAutoClear(false)
		.moveTo("Recording");

	cp5.addTextlabel("fnameRecording")
		.setPosition(width*3/4 - 350*ratio, height*5/6 - 95*ratio)
		.setText("File Name:")
		.setFont(createFont("Arial", 23))
		.setColorValue(0)
		.moveTo("Recording");

	fname_remixing = cp5.addTextfield("nameRemixing")
		.setLabel("")
		.setPosition(width*3/4 - 190*ratio, height*5/6 - 100*ratio)
		.setSize(int(540*ratio),int(40*ratio))
		.setFont(createFont("Arial", 20))
		.setColor(color(0))
		.setColorBackground(color(255))
		.setColorForeground(color(255, 229, 24))
		.setColorActive(color(255, 229, 24))
		.setColorCursor(color(0))
		.setAutoClear(false)
		.moveTo("Remixing");

	cp5.addTextlabel("fnameRemixing")
		.setPosition(width*3/4 - 350*ratio, height*5/6 - 95*ratio)
		.setText("File Name:")
		.setFont(createFont("Arial", 23))
		.setColorValue(0)
		.moveTo("Remixing");
}

void drawTextFieldBackground() {
	if (activeTabIndex == 1 || activeTabIndex == 2){
		// Draw background behind textfield
		stroke(255, 229, 24);
		strokeWeight(6);
		rect(width*3/4 - 190*ratio, height*5/6 - 100*ratio, 540*ratio, 40*ratio);
	}
}
