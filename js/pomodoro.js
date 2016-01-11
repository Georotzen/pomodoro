// Global Variables
var $clockDisplay = $(".clock-display");
var time = 25;
var secondsLeft = time * 60;

function changeLength(btn, btnParent) {
	var $length = $(btnParent).find($(".length"));
	var $timeUnit = $(btnParent).find($(".time-unit"));
	var thisTime = $length.text();

	function pluralize(minutes) {
		var units;
		if (minutes > 1) units = "minutes";
		else units = "minute";
		return units;
	}

	// Adjust the option time length display
	if (btn === "+") thisTime++;
	else if (btn === "-" && thisTime > 1) thisTime--;

	// Adjust the main clock display if the btnParent is "Session Length"
	if (btnParent === ".session") {
		$clockDisplay.html(thisTime + "<br><span>" + pluralize(thisTime) + "</span>");
		time = thisTime;
		secondsLeft = time * 60;
	}

	// Update the length displays
	$length.text(thisTime);
	$timeUnit.text(pluralize(thisTime));
	return;
}

function startTimer(duration, display) {
    var start = Date.now(),
        diff,
        hours,
        minutes,
        seconds,
        intervalID;
    function timer() {
        // get the number of seconds that have elapsed since 
        // startTimer() was called
        diff = duration - (((Date.now() - start) / 1000) | 0); 

        hours = (diff / 3600) | 0;
        minutes = ((diff % 3600) / 60) | 0;
        seconds = (diff % 60) | 0;

        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.html(hours > 0 ? (hours + " : " + minutes + " : " + seconds) : ""  + minutes + " : " + seconds); 

        if (diff <= 0) {
            // add one second so that the count down starts at the full duration
            start = Date.now() + 1000;
        }
        // stop the timer at 0 seconds remaining
        if (diff < 1) {
        	clearInterval(intervalID);
        	changeLength(0, ".session");
        }
	};
	
    // we don't want to wait a full second before the timer starts
    timer();
    intervalID = setInterval(timer, 1000);
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

function padTime(d) {
	var digits = String(d);
	while (digits.length < 2) {
		digits = "0" + digits;
	}
	return digits;
}

function buttonListeners() {
	$(".options button").click(function() {
		var btnParent = "." + $(this).parent().attr("class");
		var btn = $(this).text();
		changeLength(btn, btnParent);
	});

	$(".action button").click(function() {
		startTimer(secondsLeft, $clockDisplay);
	});
}

$(document).ready(function() {
    fill();
    buttonListeners();
});
