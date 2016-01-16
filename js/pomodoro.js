// Global Variables
var sessionLength = $(".session > .length").text() * 60,
    breakLength = $(".break > .length").text() * 60,
    sessionColor = "#2F8C2F",
    breakColor = "#AF3A3A",
    sound = true,
    t;

// Global cached jQuery Selectors
var $clockDisplay = $(".clock-display"),
    $clockContainer = $(".clock-container"),
    $clockContainerBefore = $(".clock-container-before");

// Minute or MinuteS
function pluralize(amount) {
    var grammar;
    if (amount > 1) grammar = "minutes";
    else grammar = "minute";
    return grammar;
}

/* Updates the Break and Session Length displays
	btn will be "plus" OR "minus"
	btnParent will be ".session" OR ".break"
*/
function updateLength(btn, btnParent) {
    // cache the jQuery selectors we will use
    var $thisLength = $(btnParent).find($(".length")),
        $thisTimeUnit = $(btnParent).find($(".time-unit"));

    // Get the time length that is currently shown
    var thisTime = $thisLength.text();

    // Adjust the option time length display
    if (btn === "plus" && thisTime < 1000) thisTime++;
    else if (btn === "minus" && thisTime > 1) thisTime--;

    // Update the clock display if the clock isn't active
    if (btnParent === ".session" && !t.isActive()) {
        $clockDisplay.html(thisTime + "<br><span>" + pluralize(thisTime) + "</span>");
        $(".clock-which").text("Session");
    }

    // Update the length displays
    $thisLength.text(thisTime);
    $thisTimeUnit.text(pluralize(thisTime));

    // Update the time variables and current clock time if the clock isn't active
    if (btnParent === ".session") {
        sessionLength = thisTime * 60;
        if (t.isActive()) t.update(btnParent, sessionLength);
    } else if (btnParent === ".break") {
        breakLength = thisTime * 60;
        if (t.isActive()) t.update(btnParent, breakLength);
    }

    return;
}

// Timer object
var timer = function(sTime, bTime, display) {
    var hours,
        minutes,
        seconds,
        intervalID,
        paused = false,
        active = false,
        startSecs = sTime,
        counter = sTime + 1,
        color = sessionColor,
        whichActive = ".session";

    var startTimer = function(which) {
        if (!paused) {
            counter--;
            updateDisplay(which); // update the clock display in hours/minutes/seconds
            // start playing sound with 1 second remaining if sound is on
            if (counter == 1 && sound) $(".alarm").trigger("play");
            // switch from Session to Break and vice versa when the timer has 0 seconds remaining
            if (counter < 1) switchTimer(which);
        }
    }

    var updateDisplay = function() {
        hours = (counter / 3600) | 0;
        minutes = ((counter % 3600) / 60) | 0;
        seconds = (counter % 60) | 0;

        // Pad the time with zeros if needed
        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.html(hours > 0 ? (hours + " : " + minutes + " : " + seconds) : "" + minutes + " : " + seconds);
        if (sound) $(".tick").trigger("play");
        fill();
        return;
    }

    // gradually fills the clock background color based on seconds remaining
    var fill = function() {
        var per = Math.abs((counter / startSecs) * 100 - 100);
        per++;
        $clockContainer.css({
            background: "linear-gradient(to top, " + color + " " + per + "%,transparent " + per + "%,transparent 100%)"
        });
    }

    // change from Session to Break and vice versa
    var switchTimer = function(which) {
        clearInterval(intervalID);
        var w = which;
        if (w === "Session") {
            w = "Break!";
            counter = bTime + 1;
            whichActive = ".break";
            color = breakColor;
            startSecs = bTime;
        } else {
            w = "Session";
            counter = sTime + 1;
            whichActive = ".session";
            color = sessionColor;
            startSecs = sTime;
        }
        $(".clock-which").text(w);
        $clockContainerBefore.css("border-color", color);
        intervalID = setInterval(function() {
            startTimer(w)
        }, 1000);
    }

    // Turns the sound on and off
    this.toggleSound = function() {
        if (sound) sound = false;
        else sound = true;
    }

    // If there is no active timer we need to make and start a new interval
    // if there is already an active timer, then just un-pause it so it continues running
    this.run = function() {
        if (!active) {
            active = true;
            paused = false;
            startTimer("Session");
            $clockContainerBefore.css("border-color", color);
            return intervalID = setInterval(function() {
                startTimer("Session")
            }, 1000);
        } else {
            return paused = false;
        }
    }

    // Clears the current active timer
    this.restart = function() {
        active = false;
        paused = true;
        $clockContainer.css("background", "transparent");
        $clockContainerBefore.css("border-color", "#FFF");
        return clearInterval(intervalID);
    }

    // Pause the timer
    this.pause = function() {
        return paused = true;
    }

    // Let's us know if the timer is already active (paused or running)
    this.isActive = function() {
        return active;
    }

    // updates the Session and Break lengths
    this.update = function(which, newTime) {
        if (which === ".session") return sTime = newTime;
        else if (which === ".break") return bTime = newTime;
    }
}

// Listens for buttons/divs to be clicked and perform specific actions
function buttonListeners() {
    $(".minus, .plus").click(function() {
        var btnParent = "." + $(this).parent().attr("class"),
            btn = $(this).attr("class");

        updateLength(btn, btnParent);
    });

    $(".start").click(function() {
        if (!t.isActive()) t = new timer(sessionLength, breakLength, $clockDisplay);
        $(this).hide(0, function() {
            $(".pause").show(0);
        });
        t.run();
    });

    $(".pause").click(function() {
        $(this).hide(0, function() {
            $(".start").show(0);
        });
        t.pause();
    });

    $(".reset").click(function() {
        if (t.isActive()) {
            $(".pause").hide(0, function() {
                $(".start").show(0);
            });
            t.restart();
            updateLength(null, ".session");
        }
    });

    $(".sound-on").click(function() {
        $(this).hide(0, function() {
            $(".sound-off").show(0);
        });
        t.toggleSound();
    });

    $(".sound-off").click(function() {
        $(this).hide(0, function() {
            $(".sound-on").show(0);
        });
        t.toggleSound();
    });
}

$(document).ready(function() {
    t = new timer(sessionLength, breakLength, $clockDisplay);
    buttonListeners();
});
