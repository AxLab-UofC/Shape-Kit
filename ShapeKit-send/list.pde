import java.io.File;
ArrayList<String> fileNames;
ScrollableList[] lists = new ScrollableList[3];
String[] selectedItemList = new String[3];
String selectedItemToRemix;

void setScrollableList(ControlP5 cp5) {
	fileNames = new ArrayList<String>();
	File dataDirectory = new File(dataPath(""));
	File[] files = dataDirectory.listFiles();
	for (File file : files) {
		fileNames.add(file.getName());
	}

	for (int i=0; i<selectedItemList.length; i++) {
		selectedItemList[i] = "";
	}

	int bg_width = int(700*ratio);
	int[] bg_heights = {int(450*ratio), int(400*ratio), int(650*ratio)};
	int bg_x = width*3/4 - (int)(350*ratio);
	int bg_y = height/5;

	for(int i=1; i<tabs.length; i++){
		/* add a ScrollableList, by default it behaves like a DropdownList */
		lists[i-1] = cp5.addScrollableList("list".concat(String.valueOf(i)))
			.setLabel("Log files") 
			.setPosition(bg_x, bg_y)
			.setSize(bg_width, bg_heights[i-1])
			.setColorBackground(color(255, 229, 24)) 
			.setBarHeight(50)
			.setItemHeight(40)
			.addItems(fileNames)
			.setType(ScrollableList.LIST)
			.moveTo(tabs[i]);

		lists[i-1].getCaptionLabel().setFont(createFont("Arial", 25, true)).setPaddingY(10);
		lists[i-1].getValueLabel().setFont(createFont("Arial", 20, true)).setPaddingY(10);
	}
}

// Called by controlEvent when an item is selected
// Update selectedItem
void updateSelectedItem(ControlEvent event) {
	int index = (int) event.getValue(); // Get the index of the selected item
	selectedItemList[activeTabIndex-1] = lists[activeTabIndex-1].getItem(index).get("name").toString(); // Get the selected item
	println("Selected item: " + selectedItemList[activeTabIndex-1]);
}
