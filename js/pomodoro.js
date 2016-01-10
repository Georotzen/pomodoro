$(document).ready(function() {
    var per = 0;
    setInterval(function() {
        per++;
        if (per <= 100) {
            $('.clock-container').css({
                background: "linear-gradient(to top, green " + per + "%,transparent " + per + "%,transparent 100%)"
            });
        }
    }, 100);
});
