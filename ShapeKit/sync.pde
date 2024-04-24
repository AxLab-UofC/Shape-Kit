import java.io.InputStreamReader;
import java.util.*;

int[] outputCubes = {0,5,10,15,20,21,16,11,6,1,2,7,12,17,22,23,18,13,8,3,4,9,14,19,24};
Process process;
float[][] initHeights;
float[][] syncHeights;

boolean isSyncing = false;		// Whether sync is turned on
boolean syncInited = false;		// Whether the initial position is recorded
boolean heightsSynced = false;	// Whether the heights has been updated

void _startSync() {
	isSyncing = true;
	syncInited = false;
	String scriptPath = dataPath("../blob_yaxis_ind.py");
	println(scriptPath);
	try {
		process = Runtime.getRuntime().exec("/usr/local/bin/python3 " + scriptPath);
		println(process);
	}
	catch (IOException e) {
		e.printStackTrace();
	}
}

void _stopSync() {
	isSyncing = false;
	println(process);
	if (process != null) {
		println("Destroy process");
		process.destroy();
	}
}

void oscEvent(OscMessage msg) {

	if (msg.checkAddrPattern("/setTarget")) {
	
		int msgLength = msg.typetag().length()/2;
		println(msg.addrPattern());
		println(msgLength);

		if (msgLength < cols*rows) {
			return;
		}

		syncHeights = new float[cols][rows];

		if (msgLength == cols*rows) {
			for (int i=0; i<msgLength; i++) {
				syncHeights[outputCubes[i]/rows][outputCubes[i]%rows] = msg.get(i*2+1).floatValue()/10;
			}
		}

		else {
			float[][] candidates = new float[msgLength][2];
			float[][] heights = new float[cols*rows][2];

			// Sort out the first rows*cols values
			for (int i=0; i<msgLength; i++) {
				candidates[i][0] = msg.get(i*2).floatValue();
				candidates[i][1] = msg.get(i*2+1).floatValue();
			}
			Arrays.sort(candidates, Comparator.comparingDouble(a -> a[1]));
			for (int i=0; i<cols*rows; i++) {
				heights[i][0] = candidates[i][0];
				heights[i][1] = candidates[i][1];
			}

			// Sort by x index
			Arrays.sort(heights, Comparator.comparingDouble(a -> a[1]));

			// Update syncHeights
			for (int i=0; i<cols*rows; i++) {
				syncHeights[outputCubes[i]/rows][outputCubes[i]%rows] = heights[i][1]/10;
			}
		}

		heightsSynced = true;

		if (!syncInited) {
			initHeights = syncHeights.clone();
			syncInited = true;
			println("sync heights initiated.");
		}
	}
}


void updateSyncHeights(int i,int j) {
	cubeHeights[i][j] = 100 + initHeights[i][j] - syncHeights[i][j];
}

void drawSyncCubes(float startX, float startY) {
	if (!heightsSynced){
		return;
	}

	for (int i = 0; i < rows; i++) {
		for (int j = 0; j < cols; j++) {
			updateSyncHeights(i, j);
			scene3D.pushMatrix(); // Save the current transformation matrix
			scene3D.translate(startX + i * spacing, startY + j * spacing, cubeHeights[i][j] / 2); // Position cube based on height
			scene3D.box(cubeWidth, cubeWidth, cubeHeights[i][j]); // Draw the box with height along z-axis
			scene3D.popMatrix(); // Restore the original transformation matrix
		}
	}

	heightsSynced = false;
}

