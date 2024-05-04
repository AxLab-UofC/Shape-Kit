Slider heightSlider, speedSlider;

void setRemixingSliders(ControlP5 cp5) {
	heightSlider = cp5.addSlider("Height")
		.setPosition(width*3/4 - 240*ratio, height*5/6 - 230*ratio)
		.setSize(int(590*ratio), int(40*ratio))
		.setRange(0,2)
		.setValue(1.0)
		.setColorBackground(color(200)) // Set the background color
		.setColorForeground(color(255, 229, 24)) // Set the bar color
		.setColorActive(color(255, 229, 24))
		.moveTo("Remixing");

	cp5.addTextlabel("labelHeight")
		.setPosition(width*3/4 - 350*ratio, height*5/6 - 230*ratio)
		.setText("Height")
		.setFont(createFont("Arial", 25))
		.setColorValue(0)
		.moveTo("Remixing");

	cp5.getController("Height").getValueLabel().setFont(createFont("Arial", 20, true)).setColor(0);
	cp5.getController("Height").getCaptionLabel().setVisible(false);

	speedSlider = cp5.addSlider("Speed")
		.setPosition(width*3/4 - 240*ratio, height*5/6 - 170*ratio)
		.setSize(int(590*ratio), int(40*ratio))
		.setRange(0,2)
		.setValue(1.0)
		.setColorBackground(color(200)) // Set the background color
		.setColorForeground(color(255, 229, 24)) // Set the bar color
		.setColorActive(color(255, 229, 24))
		.moveTo("Remixing");

	cp5.addTextlabel("labelSpeed")
		.setPosition(width*3/4 - 350*ratio, height*5/6 - 170*ratio)
		.setText("Speed")
		.setFont(createFont("Arial", 25))
		.setColorValue(0)
		.moveTo("Remixing");

	cp5.getController("Speed").getValueLabel().setFont(createFont("Arial", 20, true)).setColor(0);
	cp5.getController("Speed").getCaptionLabel().setVisible(false);
}
