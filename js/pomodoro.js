// Global Variables
var $clockDisplay = $(".clock-display");
var sessionTime;
var breakTime;
var isRunning = false;
var isPaused = false;
var t;

function minToSec(min) {
    return min * 60;
}

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

function changeLength(btn, btnParent) {
    var $length = $(btnParent).find($(".length"));
    var $timeUnit = $(btnParent).find($(".time-unit"));
    var thisTime = $length.text();

    // Adjust the option time length display
    if (btn === "+" && thisTime < 1000) thisTime++;
    else if (btn === "-" && thisTime > 1) thisTime--;

    // Adjust the main clock display if the btnParent is "Session Length"
    if (btnParent === ".session") {
        $clockDisplay.html(thisTime + "<br><span>" + pluralize(thisTime) + "</span>");
        $(".clock-which").text("Session");
    }

    // Update the length displays
    $length.text(thisTime);
    $timeUnit.text(pluralize(thisTime));
    return;
}

var timer = function(display) {
    var counter,
        time,
        hours,
        minutes,
        seconds,
        intervalID;

    // set some intial values when - new timer() - is called
    sessionTime = minToSec($(".session div").text());
    breakTime = minToSec($(".break div").text());
    time = sessionTime;
    counter = time + 1;

    var startTimer = function(which) {
        if (!isPaused) {
            counter--;

            hours = (counter / 3600) | 0;
            minutes = ((counter % 3600) / 60) | 0;
            seconds = (counter % 60) | 0;

            hours = hours < 10 ? "0" + hours : hours;
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            $(".clock-which").text(which);
            display.html(hours > 0 ? (hours + " : " + minutes + " : " + seconds) : "" + minutes + " : " + seconds);

            // switch from Session to Break and vice versa when the timer has 0 seconds remaining
            if (counter < 1) {
                switchTimer(which);
            }
        }
    };

    var switchTimer = function(which) {
        clearInterval(intervalID);
        var w = which;
        if (w === "Session") {
            w = "Break!";
            time = breakTime;
            counter = time + 1;
        } else {
            w = "Session";
            time = sessionTime;
            counter = time + 1;
        }
        return intervalID = setInterval(function() {
            startTimer(w)
        }, 1000);
    }

    this.run = function() {
        if (!isPaused) {
            startTimer("Session");
            intervalID = setInterval(function() {
                startTimer("Session")
            }, 1000);
            isRunning = true;
        } else {
            isPaused = false;
        }
    }

    this.resetTimer = function() {
        clearInterval(intervalID);
        changeLength(0, ".session");
        isRunning = false;
    }

}

function buttonListeners() {
    $(".options button, .reset").click(function() {
        var btnParent = "." + $(this).parent().attr("class");
        var btn = $(this).text();

        changeLength(btn, btnParent);

        if (isRunning) {
            $(".pause").hide(100, function() {
                $(".start").show(100);
            });
            isPaused = false;
            t.resetTimer();
        }
    });

    $(".start").click(function() {
        if (!isRunning) t = new timer($clockDisplay);
        $(this).hide(100, function() {
            $(".pause").show(100);
        });
        t.run();
    });

    $(".pause").click(function() {
        $(this).hide(100, function() {
            $(".start").show(100);
        });
        isPaused = true;
    });
}

$(document).ready(function() {
    //fill();
    buttonListeners();
});
