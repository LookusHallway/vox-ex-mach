autowatch = 1;

// Inlets and outlets
inlets = 7;
outlets = 12;

// Inlet and outlet assist strings
setinletassist(0, "int: total duration in milliseconds");
setinletassist(1, "int: width of box in steps");
setinletassist(2, "int: num spiral loops");
setinletassist(3, "bang: start");
setinletassist(4, "bang: pause");
setinletassist(5, "bang: done previous mapping");
setinletassist(6, "bang: stop and reset")

setoutletassist(0, "int: LR");
setoutletassist(1, "int: UR");
setoutletassist(2, "int: LT");
setoutletassist(3, "int: UT");
setoutletassist(4, "int: TR");
setoutletassist(5, "int: TT");
setoutletassist(6, "int: window width/height")
setoutletassist(7, "int: center x");
setoutletassist(8, "int: center y");
setoutletassist(9, "bang: start");
setoutletassist(10, "bang: pause");
setoutletassist(11, "bang: stop and reset")


// Params for spiral function
var minX = 0, maxX = 20000, minY = 0, maxY = 22000; // Mapping boundaries
var totalDuration, numPeriod, windowWidth; // Specific mapping parameters with some defaults
var centerX, centerY;
var currentPeriod, currentMapLength, reverse = false
var LR, UR, LT, UT, TR = totalDuration, TT
var isRunning = false, isInitialized = false

function msg_int(value) {
    if (isInitialized) {
        post("Error: The mapping is either running or initialized. Reset first.");
        return;
    }
    switch(inlet) {
        case 0:
            totalDuration = value;
            break;
        case 1:
            windowWidth = value;
            windowHeight = value;
            break;
        case 2:
            numPeriod = value;
            break;
        default:
            post("Error: received int through inlet " + inlet + ".");
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
    }
}

function startMapping() {
    if (isRunning) {
        post("Error: The mapping is already running and received instruction to start again.");
        return;
    }

    if (totalDuration == null || numPeriod == null || windowWidth == null) {
        post("Error: must set duration, spirals, and width before starting.\n");
        return;
    }

    if (isInitialized && !isRunning) { // Mapping is paused
        isRunning = true;
        outlet(9, "bang"); // Start line function again
    } else { // Start new ramp
        calculateMapping();

        currenPeriod = 1;
        isInitialized = true;
        isRunning = true;
        reverse = false;

        outlet(0, LR);
        outlet(1, UR);
        outlet(2, LT);
        outlet(3, UT);
        outlet(4, TR);
        outlet(5, TT);
        outlet(6, windowWidth);
        outlet(7, centerX);
        outlet(8, centerY);
        outlet(9, "bang");
        post("Spiral mapping started with " + numPeriod + " periods over " + totalDuration + " ms.");
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
    outlet(10, "bang"); // Send pause bang
}

function stopMapping() {
    isRunning = false;
    isInitialized = false;
    currentPeriod = 1;

        outlet(0, LR);
        outlet(1, UR);
        outlet(2, LT);
        outlet(3, UT);
        outlet(4, TR);
        outlet(5, TT);
        outlet(6, windowWidth);
    outlet(11, "bang"); // Send stop bang
}

function calculateMapping() {
    centerX = (minX + maxX)/2;
    centerY = (minY + maxY)/2;

    LR = maxX - centerX - windowWidth;
    UR = 0;
    LT = 0;
    UT = 2*Math.PI*numPeriod;
    TR = totalDuration;
    TT = Math.floor(totalDuration / numPeriod);    
    post(TR);
}

function nextMapping() {

    if (!reverse) reverse = true;
    else reverse = false;
    
    if (!reverse) {
        outlet(0, LR);
        outlet(1, UR);
        outlet(2, LT);
        outlet(3, UT);
        outlet(4, TR);
        outlet(5, TT);
        outlet(6, windowWidth);
        outlet(11, "bang"); // Reset the previous ramp
        outlet(9, "bang"); // Start new ramp
    } else {
        outlet(0, UR);
        outlet(1, LR);
        outlet(2, LT);
        outlet(3, UT);
        outlet(4, TR);
        outlet(5, TT);
        outlet(6, windowWidth);
        outlet(11,"bang"); // Reset the previous ramp
        outlet(9, "bang"); // Start new ramp
    }
}