// Global Variables
var $clockDisplay = $(".clock-display"),
    $clockContainer = $(".clock-container"),
    $clockContainerBefore = $(".clock-container-before"),
    sessionLength = $(".session > .length").text() * 60,
    breakLength = $(".break > .length").text() * 60,
    sessionColor = "#2F8C2F",
    breakColor = "#AF3A3A",
    sound = true,
    t;

function pluralize(amount) {
    var grammar;
    if (amount > 1) grammar = "minutes";
    else grammar = "minute";
    return grammar;
}

function updateLength(btn, btnParent) {
    var $thisLength = $(btnParent).find($(".length")),
        $thisTimeUnit = $(btnParent).find($(".time-unit")),
        thisTime = $thisLength.text();

    // Adjust the option time length display
    if (btn === "plus" && thisTime < 1000) thisTime++;
    else if (btn === "minus" && thisTime > 1) thisTime--;

    // Adjust the main clock display if the btnParent is "Session Length" and clock is not running
    if (btnParent === ".session" && !t.isRunning()) {
        $clockDisplay.html(thisTime + "<br><span>" + pluralize(thisTime) + "</span>");
        $(".clock-which").text("Session");
    }

    // Update the length displays
    $thisLength.text(thisTime);
    $thisTimeUnit.text(pluralize(thisTime));

    // Update the time variables and current clock time
    if (btnParent === ".session") {
        sessionLength = thisTime * 60;
        if (t.isRunning()) t.update(btnParent, sessionLength);
    } else if (btnParent === ".break") {
        breakLength = thisTime * 60;
        if (t.isRunning()) t.update(btnParent, breakLength);
    }

    return;
}

var timer = function(sTime, bTime, display) {
    var hours,
        minutes,
        seconds,
        intervalID,
        that = this,
        paused = false,
        running = false,
        startSecs = sTime,
        counter = sTime + 1,
        color = sessionColor,
        whichActive = ".session";


    var startTimer = function(which) {
        if (!paused) {
            counter--;
            updateDisplay(which);
            // switch from Session to Break and vice versa when the timer has 0 seconds remaining
            if (counter == 1 && sound) $(".alarm").trigger("play");
            if (counter < 1) switchTimer(which);
        }
    }

    var updateDisplay = function() {
        hours = (counter / 3600) | 0;
        minutes = ((counter % 3600) / 60) | 0;
        seconds = (counter % 60) | 0;

        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.html(hours > 0 ? (hours + " : " + minutes + " : " + seconds) : "" + minutes + " : " + seconds);
        if (sound) $(".tick").trigger("play");
        fill();
        return;
    }

    var fill = function() {
        var per = Math.abs((counter / startSecs) * 100 - 100);
        per++;
        $clockContainer.css({
            background: "linear-gradient(to top, " + color + " " + per + "%,transparent " + per + "%,transparent 100%)"
        });
    }

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

    this.toggleSound = function() {
        if (sound) sound = false;
        else sound = true;
    }

    this.run = function() {
        if (!running) {
            running = true;
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

    this.restart = function() {
        running = false;
        paused = true;
        $clockContainer.css("background", "transparent");
        $clockContainerBefore.css("border-color", "#FFF");
        return clearInterval(intervalID);
    }

    this.pause = function() {
        return paused = true;
    }

    this.isRunning = function() {
        return running;
    }

    this.update = function(which, newTime) {
        if (which === ".session") return sTime = newTime;
        else if (which === ".break") return bTime = newTime;
    }
}

function buttonListeners() {
    $(".minus, .plus").click(function() {
        var btnParent = "." + $(this).parent().attr("class"),
            btn = $(this).attr("class");

        updateLength(btn, btnParent);
    });

    $(".start").click(function() {
        if (!t.isRunning()) t = new timer(sessionLength, breakLength, $clockDisplay);
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
        if (t.isRunning()) {
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
