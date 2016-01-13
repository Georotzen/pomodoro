// Global Variables
var $clockDisplay = $(".clock-display"),
    sessionLength = $(".session div").text() * 60,
    breakLength = $(".break div").text() * 60,
    t;

function pluralize(amount) {
    var grammar;
    if (amount > 1) grammar = "minutes";
    else grammar = "minute";
    return grammar;
}

function fill() {
    var per = 0;
    setInterval(function() {
        per++;
        if (per <= 100) {
            $('.clock-container').css({
                background: "linear-gradient(to top, green " + per + "%,transparent " + per + "%,transparent 100%)"
            });
        }
    }, 100);
}

function updateLength(btn, btnParent) {
    var $thisLength = $(btnParent).find($(".length")),
        $thisTimeUnit = $(btnParent).find($(".time-unit")),
        thisTime = $thisLength.text();

    // Adjust the option time length display
    if (btn === "+" && thisTime < 1000) thisTime++;
    else if (btn === "-" && thisTime > 1) thisTime--;

    // Adjust the main clock display if the btnParent is "Session Length"
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
    var counter = sTime + 1,
        running = false,
        paused = false,
        whichActive = ".session",
        that = this,
        hours,
        minutes,
        seconds,
        intervalID;

    var startTimer = function(which) {
        if (!paused) {
            counter--;
            updateDisplay(counter);
            $(".clock-which").text(which);
            // switch from Session to Break and vice versa when the timer has 0 seconds remaining
            if (counter < 1) {
                switchTimer(which);
            }
        }
    }

    var updateDisplay = function(count) {
        hours = (counter / 3600) | 0;
        minutes = ((counter % 3600) / 60) | 0;
        seconds = (counter % 60) | 0;

        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.html(hours > 0 ? (hours + " : " + minutes + " : " + seconds) : "" + minutes + " : " + seconds);
        return;
    }

    var switchTimer = function(which) {
        clearInterval(intervalID);
        var w = which;
        if (w === "Session") {
            w = "Break!";
            counter = bTime + 1;
            whichActive = ".break";
        } else {
            w = "Session";
            counter = sTime + 1;
            whichActive = ".session";
        }
        intervalID = setInterval(function() {
            startTimer(w)
        }, 1000);
    }

    this.run = function() {
        if (!running) {
            running = true;
            paused = false;
            startTimer("Session");
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
        return clearInterval(intervalID);
    }

    this.pause = function() {
        return paused = true;
    }

    this.isRunning = function() {
        return running;
    }

    this.update = function(which, newTime) {
        if (which === ".session") sTime = newTime;
        else if (which === ".break") bTime = newTime;

        if (whichActive === which) {
            counter = newTime;
            that.pause();
            updateDisplay(counter);

            function runDelay() {
                that.run();
            }
            setTimeout(runDelay, 1500);
        }
    }
}

function buttonListeners() {
    $(".options button").click(function() {
        var btnParent = "." + $(this).parent().attr("class"),
            btn = $(this).text();

        updateLength(btn, btnParent);
    });

    $(".start").click(function() {
        if (!t.isRunning()) t = new timer(sessionLength, breakLength, $clockDisplay);
        $(this).hide(100, function() {
            $(".pause").show(100);
        });
        t.run();
    });

    $(".pause").click(function() {
        $(this).hide(100, function() {
            $(".start").show(100);
        });
        t.pause();
    });

    $(".reset").click(function() {
        if (t.isRunning()) {
            $(".pause").hide(100, function() {
                $(".start").show(100);
            });
            t.restart();
            updateLength(null, ".session");
        }
    });
}

$(document).ready(function() {
    //fill();
    t = new timer(sessionLength, breakLength, $clockDisplay);
    buttonListeners();
});
