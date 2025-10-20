autowatch = 1;

inlets = 6;
outlets = 3;

setinletassist(0, "float: X origin");
setinletassist(1, "float: Mapping X");
setinletassist(2, "float: Window Width");
setinletassist(3, "float: Y origin");
setinletassist(4, "float: Mapping Y");
setinletassist(5, "float: Window Height");

setoutletassist(0, "theta (radians)");
setoutletassist(1, "X Rotated");
setoutletassist(2, "Y Rotated");

var originX = 0;
var mappingX = 0;
var windowWidth = 0;
var originY = 0;
var mappingY = 0;
var windowHeight = 0;

var MasterXorigin = 10000;
var MasterYorigin = 11000;
var windowXorigin = 0.5;
var windowYorigin = 0.5;

function msg_float(v) {
    switch (inlet) {
        case 0: originX = v; break;
        case 1: mappingX = v; break;
        case 2: windowWidth = v; break;
        case 3: originY = v; break;
        case 4: mappingY = v; break;
        case 5: windowHeight = v; break;
    }
    calculateAndRotate();
}

function calculateAndRotate() {
    var Xleg = MasterXorigin - originX - windowXorigin * windowWidth;
    var Yleg = MasterYorigin - originY - windowYorigin * windowHeight;
    var theta = Math.atan2(Yleg, Xleg) + (Math.PI/2.0);
	var thetaDeg = theta * 180 / Math.PI;

    var dx = mappingX - windowXorigin;
    var dy = mappingY - windowYorigin;

    var xr = dx * Math.cos(theta) - dy * Math.sin(theta);
    var yr = dx * Math.sin(theta) + dy * Math.cos(theta);

    var rotatedX = Math.min(Math.max(xr + 0.5, 0), 1);
    var rotatedY = Math.min(Math.max(yr + 0.5, 0), 1);

    outlet(0, thetaDeg);
    outlet(1, rotatedX);
    outlet(2, rotatedY);
}

 
