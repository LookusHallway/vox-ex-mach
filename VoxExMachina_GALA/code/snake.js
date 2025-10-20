autowatch = 1;

// Inlets and outlets
inlets = 7;
outlets = 9;

// Ilet and outlet assist strings
setinletassist(0, "int: total duration in milliseconds");
setinletassist(1, "int: number of lines for snake");
setinletassist(2, "int: width of box in steps")
setinletassist(3, "bang: start");
setinletassist(4, "bang: pause");
setinletassist(5, "bang: done previous mapping");
setinletassist(6, "bang: stop and reset")

setoutletassist(0, "int: LX");
setoutletassist(1, "int: UX");
setoutletassist(2, "int: LY");
setoutletassist(3, "int: UY");
setoutletassist(4, "int: time");
setoutletassist(5, "int: window height");
setoutletassist(6, "bang: start");
setoutletassist(7, "bang: pause");
setoutletassist(8, "bang: stop and reset")


// Params for snake function
var minX = 2000, maxX = 20500, minY = 0, maxY = 22000; // Mapping boundaries
var totalDuration, numLines, windowWidth, windowHeight // Specific mapping parameters
var currentMapIndex, currentMapLength, reverse = false
var LX = [], UX = [], LY = [], UY = [], time = []
var isRunning = false, isInitialized = false

function msg_int(value) {
    switch(inlet) {
        case 0:
            totalDuration = value;
            break;
        case 1:
            numLines = value;
            break;
        case 2:
            windowWidth = value;
            break;
        default:
            post("Error: received int through inlet " + inlet + ".\n");
            return;
    }

    // Recalculate mapping anytime values change and are all set
    if (totalDuration != null && numLines != null && windowWidth != null) {
        calculateMapping();
        isInitialized = false;  // Allow remapping on next start
        post("Mapping recalculated with duration " + totalDuration + ", lines " + numLines + ", width " + windowWidth + "\n");

        // Optionally output current values to outlets
        currentMapIndex = 0;
        outlet(0, LX[currentMapIndex]);
        outlet(1, UX[currentMapIndex]);
        outlet(2, LY[currentMapIndex]);
        outlet(3, UY[currentMapIndex]);
        outlet(4, time[currentMapIndex]);
        outlet(5, windowHeight);
    }
}

function bang() {
    switch(inlet) {
        case 3:
            startMapping();
            break;
        case 4:
            pauseMapping();
            break;
        case 5:
            nextMapping();
            break;
        case 6:
            stopMapping();
            break;
        default:
            // For bang on inlet 0, 1, or 2: trigger recalculation
            if (totalDuration != null && numLines != null && windowWidth != null) {
                calculateMapping();
                isInitialized = false;
                post("Mapping recalculated via bang.\n");

                currentMapIndex = 0;
                outlet(0, LX[currentMapIndex]);
                outlet(1, UX[currentMapIndex]);
                outlet(2, LY[currentMapIndex]);
                outlet(3, UY[currentMapIndex]);
                outlet(4, time[currentMapIndex]);
                outlet(5, windowHeight);
            }
            break;
    }
}

function startMapping() {
    if (isRunning) {
        post("Error: The mapping is already running and received instruction to start again.");
        return;
    }

    if (totalDuration == null || numLines == null || windowWidth == null) {
        post("Error: must set duration, lines, and width before starting.\n");
        return;
    }

    if (isInitialized && !isRunning) { // Mapping is paused
        isRunning = true;
        outlet(6, "bang"); // Start line function again
    } else { // Start new ramp
        calculateMapping();

        currentMapIndex = 0;
        isInitialized = true;
        isRunning = true;
        reverse = false;

        outlet(0, LX[currentMapIndex]);
        outlet(1, UX[currentMapIndex]);
        outlet(2, LY[currentMapIndex]);
        outlet(3, UY[currentMapIndex]);
        outlet(4, time[currentMapIndex]);
        outlet(5, windowHeight);
        outlet(6, "bang");
        post("Snake mapping started with " + numLines + " lines over " + time[0] + " ms per line.");
    }
}

function pauseMapping() {
    if (!isInitialized) {
        post("Error: Trying to pause map that isn't initialized");
        return;
    }
    if (!isRunning) { // Map is already paused
        post("Error: The map is already paused and received instruction to pause again.");
        return;
    }
    isRunning = false;
    outlet(7, "bang"); // Send pause bang
}

function stopMapping() {
    isRunning = false;
    isInitialized = false;
    currentMapIndex = 0;

    outlet(0, LX[currentMapIndex]);
    outlet(1, UX[currentMapIndex]);
    outlet(2, LY[currentMapIndex]);
    outlet(3, UY[currentMapIndex]);
    outlet(4, time[currentMapIndex]);

    LX = [], UX = [], LY = [], UY = [], time = []
    outlet(8, "bang") // Send stop bang
}

function calculateMapping() {
    currentMapLength = numLines;
    windowHeight = Math.floor(maxY / numLines);
    
    for (var i = 0; i < numLines; i++) {
        if (i % 2 == 0) {
            /* On even-numbered indices, the window moves from left to right */
            LX[i] = minX;
            UX[i] = maxX - windowWidth;
        } else {
             /* On odd-numbered indices, the window moves from right to left */
            LX[i] = maxX - windowWidth;
            UX[i] = minX;
        }
        LY[i] = windowHeight * i
        UY[i] = windowHeight * i
        time[i] = Math.round(totalDuration / numLines);
    }
}

function nextMapping() {

    if (currentMapIndex == currentMapLength - 1 && !reverse) reverse = true;
    else if (currentMapIndex == 0 && reverse) reverse = false;
    
    if (!reverse) currentMapIndex++;
    else currentMapIndex--;
        
        
    outlet(0, LX[currentMapIndex]);
    outlet(1, UX[currentMapIndex]);
    outlet(2, LY[currentMapIndex]);
    outlet(3, UY[currentMapIndex]);
    outlet(4, time[currentMapIndex]);
    outlet(5, windowHeight);
    outlet(8, "bang"); // Reset the previous ramp
    outlet(6, "bang"); // Start new ramp
}