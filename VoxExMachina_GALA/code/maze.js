autowatch = 1;

inlets = 10;
outlets = 6;

// Inlet and outlet assist strings
setinletassist(0, "float: amplitude");
setinletassist(1, "int: pitch (will be quantized)");
setinletassist(2, "number of quantized thresholds");
setinletassist(3, "float: scaling for speed (0. to 1.)");
setinletassist(4, "bang: start");
setinletassist(5, "bang: pause");
setinletassist(6, "bang: kill");
setinletassist(7, "bang: put system metro here")
setinletassist(8, "int: pitch minimum");
setinletassist(9, "int: pitch maximum");

setoutletassist(0, "float: targetX (0 or 1 if horizontal move)");
setoutletassist(1, "float: targetY (0 or 1 if vertical move)");
setoutletassist(2, "float: xSpeed (0..1)");
setoutletassist(3, "float: ySpeed (0..1)");
setoutletassist(4, "float: currentX (debugging)");
setoutletassist(5, "float: currentY (debugging)");

// Params for quantizing pitch and calculating speed
var pitchLow;
var pitchHigh;
var numThresholds = 8, amplitude = 0.0, pitch = 0, scaling = 0.5;

// Setting targets and keeping track of current position
var currentThresholdIndex = -1;
var direction = "h";
var currentX, currentY;
var targetX, targetY;
var isInitialized = false, isRunning = false;

var lastUpdateTime = Date.now() / 1000.0; // seconds

/* Sets new target. If the current direction is horizontal, then the new
direction is vertical, and vice versa. The new target is at the edge of
the window and perpendicular to the current velocity vector. */
function chooseNewTarget() {
    direction = (direction == "h") ? "v" : "h";
    post("Direction switched to: ", direction, "\n");
    var choice = (Math.random() < 0.5) ? 0.0 : 1.0;
    if (direction == "h") {
        if (Math.abs(choice - currentX) < 1e-6) {
            choice = (choice === 0.0) ? 1.0 : 0.0;
        }
        targetX = choice;
        targetY = currentY;
    } else {
        if (Math.abs(choice - currentY) < 1e-6) {
            choice = (choice === 0.0) ? 1.0 : 0.0;
        }
        targetY = choice;
        targetX = currentX;
    }
}

/* Calculates the index of the pitch threshold as defined by numThresholds,
pitchLow, and pitchHigh. Each threshold is evenly spaced. */
function computeThresholdIndex(p) {
    if (p <= pitchLow) return 0;
    if (p >= pitchHigh) return numThresholds - 1;
    var ratio = (p - pitchLow) / (pitchHigh - pitchLow);
    var idx = Math.floor(ratio * numThresholds);
    if (idx >= numThresholds) idx = numThresholds - 1;
    if (idx < 0) idx = 0;
    return idx;
}

// Flips the boundary to the other side of the same axis.
function flipBoundary() {
    // If we've reached target (within epsilon) and amplitude > 0, flip to opposite boundary on same axis
    var eps = 1e-6;
    if (amplitude <= 0) return; // no movement requested
    if (direction == "h") {
        if (Math.abs(currentX - targetX) < eps) {
            // flip X target
            targetX = (targetX === 1.0) ? 0.0 : 1.0;
        }
    } else {
        if (Math.abs(currentY - targetY) < eps) {
            // Flip X target
            targetY = (targetY === 1.0) ? 0.0 : 1.0;
        }
    }
}

function updatePosition() {
    var xSpeed = 0.0;
    var ySpeed = 0.0;
    var now = Date.now() / 1000.0;
    var dt = now - lastUpdateTime;
    lastUpdateTime = now;

    var speedMag = amplitude * scaling;

    // advance toward target on active axis
    if (direction == "h") { // horizontal
        if (Math.abs(currentX - targetX) > 1e-6 && speedMag > 0) {
            var sign = targetX > currentX ? 1 : -1;
            var delta = sign * speedMag * dt;
            var newX = currentX + delta;
            if ((sign > 0 && newX >= targetX) || (sign < 0 && newX <= targetX)) {
                currentX = targetX;
            } else {
                currentX = newX;
            }

        } else {
            currentX = targetX; // This corrects for overshooting the target
        }
        xSpeed = speedMag;
        // currentY unchanged
    } else { // vertical
        if (Math.abs(currentY - targetY) > 1e-6 && speedMag > 0) {
            var sign = targetY > currentY ? 1 : -1;
            var delta = sign * speedMag * dt;
            var newY = currentY + delta;
            if ((sign > 0 && newY >= targetY) || (sign < 0 && newY <= targetY)) {
                currentY = targetY;
            } else {
                currentY = newY;
            }
            
        } else {
            currentY = targetY; // This corrects for overshooting the target
        }
        ySpeed = speedMag;
        // currentX unchanged
    }
    outlet(0, targetX);
    outlet(1, targetY);
    outlet(2, xSpeed);
    outlet(3, ySpeed);

    outlet(4, currentX);
    outlet(5, currentY);

    // If at boundary, flip target to the other end of the same axis
    flipBoundary();
}

// Outputs the current target positions and speeds
function outputState() {
    // var xSpeed = 0.0;
    // var ySpeed = 0.0;
    // if (direction == "h") {
    //     if (Math.abs(currentX - targetX) > 1e-6 && amplitude > 0) {
    //         xSpeed = amplitude * scaling;
    //     }
    // } else {
    //     if (Math.abs(currentY - targetY) > 1e-6 && amplitude > 0) {
    //         ySpeed = amplitude * scaling;
    //     }
    // }
    // outlet(0, targetX);
    // outlet(1, targetY);
    // outlet(2, xSpeed);
    // outlet(3, ySpeed);
}

function msg_float(value) {
    switch (inlet) {
        case 0:
            amplitude = value;
            updatePosition();
            break;
        case 1:
            pitch = value;
            var newIndex = computeThresholdIndex(pitch);
            post(newIndex);

            // Changes target if the threshold index changes
            if (newIndex != currentThresholdIndex) {
                currentThresholdIndex = newIndex;
                chooseNewTarget();
            }
            updatePosition();
            break;
        case 3:
            scaling = value;
            break;
    }
}

function msg_int(value) {
    switch (inlet) {
        case 2:
            numThresholds = value;
            break;
        case 8:
            pitchLow = value;
            break;
        case 9:
            pitchHigh = value;
            break;
    }
}

function bang() {
    switch (inlet) {
        case 4:
            currentX = 0.0;
            currentY = 0.0;
            targetX = 0.0;
            targetY = 0.0;
            direction = "h";
            currentThresholdIndex = -1;
            isInitialized = true;
            isRunning = true;
            outlet(4, currentX);
            outlet(5, currentY);
            break;
        case 5:
            isRunning = false;
            amplitude = 0;
            break;
        case 6:
            currentX = 0.0;
            currentY = 0.0;
            targetX = 0.0;
            targetY = 0.0;
            amplitude = 1;
            isInitialized = false;
            isRunning = false;
            outlet(2, 1);
            outlet(3, 1);
            break;
        case 7:
            if (!isInitialized) return;
            updatePosition();
            outputState();
            break;
    }
}