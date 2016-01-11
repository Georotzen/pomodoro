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

function runTimer() {
	setInterval(startTimer, 1000);
}

function startTimer() {
	var hours, minutes, seconds;
	secondsLeft -= 1;
	if (secondsLeft >= 0) {
		hours = parseInt(secondsLeft / 3600);
		minutes = parseInt(secondsLeft / 60);
		seconds = parseInt(secondsLeft % 60);

		$clockDisplay.html(padTime(hours) + " : " + padTime(minutes) + " : " + padTime(seconds));
	}
	else {
		return;
	}
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
		runTimer();
	});
}

$(document).ready(function() {
    fill();
    buttonListeners();
});
