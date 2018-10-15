var widget = document.getElementsByTagName("clock-widget")[0];

console.log("Clock widget loaded");
 
setInterval(
    function () {
        if (!widget) { return; }
        var time = new Date();

        var hours = (time.getHours() - 12 < 0) ? (time.getHours() === 0) ? "12" : time.getHours() : time.getHours() - 12;
        var minutes = (time.getMinutes() < 10) ? "0" + time.getMinutes() : time.getMinutes();
        var seconds = (time.getSeconds() < 10) ? "0" + time.getSeconds() : time.getSeconds();
        var ampm = (time.getHours() - 12 <= 0) ? "AM" : "PM";

        var timestr = `${hours}:${minutes}:${seconds} ${ampm}`;

        widget.innerHTML = timestr;
    }, 1000);
