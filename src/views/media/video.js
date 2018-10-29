var vid = null;
var seeker = null;
var volume = null;
var play = null;
var fullscreen = null;

function playMedia(path) {
    var parent = document.getElementById("search-form");
    console.log(path);
    var html = `
        <div class="modal-close" onclick="closeModel()">x</div>
            <div class="media-player">
            <video class="video-player" id="video" src="${path}" onseeking="onSeek(this.currentTime)"
                onseeked="onSeek(this.currentTime)" onplaying="playingSeek()" ondurationchange="videoInit()"></video>
            <div class="player-controls">
                <div class="player-buttons">
                    <button id="play" onclick="playClick()" class="video-control">
                        <i class="fas fa-play"></i>
                    </button>
                    <button id="volume" onclick="muteClick()" class="video-control">
                        <i class="fas fa-volume-up"></i>
                        <input type="range" onchange="volumeChange(this.value)" oninput="volumeChange(this.value)" min="0" max="1" value="0" step="0.01"
                            class="volume-slider" id="volume">
                    </button>
                </div>
                <div class="player-navigation">
                    <input type="range" onchange="seek(this.value)" oninput="seek(this.value)" min="0" max="100" value="0" step="0.1" class="seek-slider"
                        id="seek-navigation">
                </div>
                <div class="player-augments">
                    <button is="google-cast-button" class="video-control" id="castButton" onclick="playRemote('${path}', 0, false)"></button>
                    <button id="fullscreen" class="video-control" onclick="fullscreenClick()">
                        <i class="fas fa-expand"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    createElement("div", { "class": "play-modal", "id": "video-modal" }, html, parent, null);
    videoInit();
}

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