autowatch = 1;

// Inlets and outlets
inlets = 7;
outlets = 3;

// Inlet and outlet assist strings
setinletassist(0, "int: low value (start of ramp)");
setinletassist(1, "int: high value (end of ramp)");
setinletassist(2, "int: duration in milliseconds");
setinletassist(3, "bang: init/start ramp");
setinletassist(4, "bang: pause ramp");
setinletassist(5, "bang: stop and reset ramp");
setinletassist(6, "bang: metro input (connect metro output here)");

setoutletassist(0, "int: current ramped value");
setoutletassist(1, "bang/stop: metro control (connect to metro)");
setoutletassist(2, "bang: ramp complete");

// Params for line function
var METRO_INTERVAL_MS = 100;
var low, high, duration, currentValue;
var stepSize, totalSteps, currentStep = 0;
var isRunning = false, isInitialized = false;

function msg_int(value) {
    switch (inlet) {
        case 0:
            low = value;
            break;
        case 1:
            high = value;
            break;
        case 2:
            duration = value;
            break;
        default:
            post("Error: received int through inlet " + inlet + ".");
    }
}

function bang() {
    switch(inlet) {
        case 3:
            // This will keep track of whether the ramp was already initialized
            startRamp();
            break;
        case 4:
            pauseRamp();
            break;
        case 5:
            stopRamp();
            break;
        case 6:
            if (isRunning) {
                stepRamp();
                break;
            }
            break;
    }
}

function startRamp() {
    if (isRunning) { // Ramp is already running
        return;
    }

    if (isInitialized && !isRunning) { // Ramp is paused
        isRunning = true;
        outlet(1, "bang"); // Start metro again
        post("Ramp resumed from value: " + currentValue + " (step " + currentStep + "/" + totalSteps + ")\n");
    } else { // Start new ramp
        calculateRamp();

        currentValue = low;
        currentStep = 0;
        isInitialized = true;
        isRunning = true;

        outlet(0, currentValue);
        outlet(1, "bang");
        post("Ramp started: " + low + " to " + high + " over " + duration + "ms (" + totalSteps + " steps)\n");
    }
}

function pauseRamp() {
    if (!isInitialized) {
        return;
    }
    if (!isRunning) { // Ramp is already paused
        return;
    }
    
    isRunning = false;
    outlet(1, "stop"); // Stop metro
    post("Ramp paused at value: " + currentValue + " (step " + currentStep + "/" + totalSteps + ")\n");

}

function stopRamp() {
    isRunning = false;
    isInitialized = false;
    currentStep = 0;
    currentValue = low;
    
    outlet(1, "stop");  // Stop metro
    outlet(0, currentValue);  // Output reset value
    
    post("Ramp stopped and reset to: " + low + "\n");
}

function stepRamp() {
    if (!isRunning) {
        return;
    }
    
    currentStep++;
    
    if (currentStep >= totalSteps) {
        // Ramp complete - ensure we hit the exact target value
        currentValue = high;
        outlet(0, currentValue);
        outlet(1, "stop");  // Stop metro
        outlet(2, "bang");  // Bang to indicate ramp complete
        
        isRunning = false;
        post("Ramp complete at value: " + currentValue + "\n");
        return;
    }
    
    // Calculate new value using linear interpolation
    var progress = currentStep / totalSteps;
    var newValue = Math.round(low + (high - low) * progress);
    
    // Only output if value has changed
    if (newValue !== currentValue) {
        currentValue = newValue;
        outlet(0, currentValue);
    }
}

function calculateRamp() {
    totalSteps = Math.floor(duration / METRO_INTERVAL_MS);
    
    if (totalSteps > 0) {
        stepSize = (high - low) / totalSteps;
    } else {
        stepSize = 0;
        totalSteps = 1;
    }
    post("Calculated: " + totalSteps + " steps, step size: " + stepSize + ", interval: " + METRO_INTERVAL_MS + "ms\n");
}