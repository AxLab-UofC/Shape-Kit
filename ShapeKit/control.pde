import controlP5.*;
import java.util.*;

ControlP5 setupControl(){
	buttonFont = createFont("Arial", 20, true); // Create a custom font for the buttons
	ControlP5 cp5 = new ControlP5(this);
	// registerMethod("controlEvent", this);

	setHeader(cp5);
	setScrollableList(cp5);
	setDefaultButtons(cp5);
	setRecordButtons(cp5);
	setRemixingSliders(cp5);
	setRemixingButtons(cp5);
	setPlayingButtons(cp5);
	setTextField(cp5);
	return(cp5);
}


void controlEvent(ControlEvent event) {

	// If a tab is clicked
	// Set active TabIndex and target position for the line under tab
	if (event.isTab()) {
		println("got an event from tab : "+event.getTab().getName()+" with id "+event.getTab().getId());
		activeTabIndex = event.getTab().getId();
		targetLinePositionX = width/4 * activeTabIndex + 30;

		// In case tab switching during remixing, turn off remixing
		if (isRemixing && activeTabIndex != 2){
			isRemixing = false;
		}
	}

	// If a text is entered in the textfield
	// Update the filename
	if (event.isAssignableFrom(Textfield.class)) {
		String activeTextfield = event.controller().getName();
		if (fname_record.getName() == activeTextfield) {
			println("Recording File name: " + fname_record.getText());
		}
		if (fname_remixing.getName() == activeTextfield) {
			println("Remixing File name: " + fname_remixing.getText());
		} 
	}

	// If an item in a list is selected, update
	if (activeTabIndex>0 && event.isFrom(lists[activeTabIndex-1])) {
		updateSelectedItem(event);
	}
}

void draw2DInterface(ControlP5 cp5) {
	// Ensures that the 2D drawing does not interfere with the 3D scene
	hint(DISABLE_DEPTH_TEST);
	cp5.draw();
	hint(ENABLE_DEPTH_TEST);
}