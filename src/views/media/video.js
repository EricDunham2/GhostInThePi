var vid = null;
var seeker = null;
var volume = null;
var play = null;
var fullscreen = null;

function videoInit() { // Add a document.onload
    vid = document.getElementById("video");
    seeker = document.getElementById("seek-navigation");
    volume = document.getElementById("volume");
    play = document.getElementById("play");
    fullscreen = document.getElementById("fullscreen");
    
    seeker.max = String(Math.ceil(vid.duration))
}

function playClick() {
    if (!vid.paused) { return pauseClick(); }
    vid.play();
}

function playingSeek(value) {
    var interval = setInterval(function () {
        seeker.value = vid.currentTime;
        if (vid.paused || vid.ended) { clearInterval(interval); }
    }, 500);
}

function pauseClick() {
    vid.pause();
}

function seek(value) {
    vid.currentTime = value;
}

function onSeek(value) {
    seeker.value = value;
}

function volumeChange(value) {
    vid.volume = Number(value);
}

function fullscreenClick() {
    vid.webkitRequestFullScreen();
}

function muteClick() {
    vid.volume = 0;
    volume.value = 0;
}