String[] tabs = {"ShapeKits", "Recording", "Remixing", "Playing"};
int activeTabIndex = 0;
float linePositionX;
float targetLinePositionX;
int tabHeight;
int speed;

void setHeader(ControlP5 cp5) {
	PFont headerFont = createFont("Arial", 20, true);
	PFont boldFont = createFont("Arial-BoldMT", 20, true);
	tabHeight = height/15;

	cp5.getTab("default")
		.setLabel(tabs[0])
		.activateEvent(true)
		.setWidth(width/4)
		.setHeight(tabHeight)
		.setColorBackground(color(255, 255, 255))
		.setColorForeground(color(255, 220, 0))
		.setColorActive(color(255, 255))
		.setColorLabel(0)
		.setId(0)
		.getCaptionLabel().setFont(boldFont).setPaddingX(30);

	for(int i=1; i<tabs.length; i++){
		cp5.addTab(tabs[i])
			.activateEvent(true)
			.setWidth(width/4)
			.setHeight(tabHeight)
			.setColorBackground(color(255, 255, 255))
			.setColorForeground(color(255, 220, 0))
			.setColorActive(color(255, 255))
			.setColorLabel(0)
			.setId(i)
			.getCaptionLabel().setFont(headerFont).setPaddingX(30);
	}

	// Initialize line position
	linePositionX = 30;
	targetLinePositionX = linePositionX;
}


// Function to update position for line below active tab
void animateLine() {
  // Animate line position
  if (abs(linePositionX - targetLinePositionX) > 10) {
    speed = int((targetLinePositionX - linePositionX) / 8);
    linePositionX += speed;

    // Check if animation is complete
    if (abs(linePositionX - targetLinePositionX) < 10) {
      linePositionX = targetLinePositionX;
    }
  }  
}

// Function to draw the lines below tabs
// Called in draw()
void drawTabs() {
  // Draw the gray line between tabs and contents
  fill(200);
  stroke(200);
  strokeWeight(5);
  line(0,tabHeight+5, width, tabHeight+5);

  // Update position for line below active tab
  animateLine();

  // Draw line below active tab
  fill(0);
  stroke(0);
  strokeWeight(10);
  float currentLinePositionX = lerp(linePositionX, targetLinePositionX, 0.1); // Smoothly interpolate line position
  line(currentLinePositionX, tabHeight, currentLinePositionX + width/16 , tabHeight);
}



