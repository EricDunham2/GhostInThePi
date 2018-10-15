var self = this;

self.media = null;
self.parents = [];
self.elements = {};

var inputPath = document.getElementById("inputPath");
inputPath.addEventListener("keydown", function (e) {
    if (e.keyCode === 13) {  //checks whether the pressed key is "Enter"
        getMedia(e.target.value);
    }
});

function getMedia(path) {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var mediafiles = JSON.parse(this.responseText);

            self.media = JSON.parse(mediafiles);
            self.parents = [];
            self.elements = {};

            if (!self.media.Name) { self.media.Name = self.media.Path.replace("\\",""); }
            self.elements[self.media.Name] = self.media;

            addParent(self.media);
            createMedia(self.media);
        }
    };

    xhttp.open("POST", "/media/findMedia", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(path);
}

function addParent(branch) {
    branch.Branches.forEach(b => {
        b['parent'] = branch
        addParent(b);
    });
}

//Change name to path 

function createMedia(data) {
    var parent = document.getElementById("file-browser");
    parent.innerHTML = "";

    if (!data.Name) { data.Name = data.Path.replace("\\",""); }

    if(data['parent']) {
        var html = `
            <div class="c_overlay">..</div>
            <i class="material-icons icon" id="back" onclick="createMedia(self.elements['${data.parent.Name}'])">folder</i>
        `;

        createElement("div", { "class": "media-file", "dir-path": ".." }, html, parent, false);
    }

    data.Branches.forEach(folder => {
        html = `
                <div class="c_overlay">${folder.Name}</div>
                <i class="material-icons icon" id="${folder.Name}" onclick="createMedia(self.elements[this.id])">folder</i>
                `;

        self.elements[folder.Name.replace("\\","")] = folder;

        var el = createElement("div", { "class": "media-file", "dir-path": folder.Path }, html, parent, false);
    });

    if (data.Nodes.length) {
        data.Nodes.forEach(file => {
            html = `
                    <div class="c_overlay">${file.Name}</div>
                    <i class="material-icons icon" onclick="playMedia('${file.Video}')">movie</i>
                `;

            var el = createElement("div", { "class": "media-file", "file-name": file }, html, parent, false);
        });
    }

}

function createElement(type, attrsMap, htmlTemplate, parent, retParent) {
    var el = document.createElement(type);
    var attributes = Object.keys(attrsMap);

    attributes.forEach(attr => {
        el.setAttribute(attr, attrsMap[attr]);
    });

    if (htmlTemplate) {
        el.innerHTML = htmlTemplate;
    }

    if (parent) {
        parent.appendChild(el);
    }

    if (!retParent || !parent) {
        return el;
    } else {
        return retParent;
    }
}

function closeModel() {
    var parent = document.getElementById("video-modal");
    parent.remove();
}

function playMedia(path) {
    var parent = document.getElementById("contents");

    var html = `
        <div class="modal-close" onclick="closeModel()">x</div>

            <div class="media-player">
            <video class="video-player" id="video" src="${path}" onseeking="onSeek(this.currentTime)"
                onseeked="onSeek(this.currentTime)" onplaying="playingSeek()" ondurationchange="init()"></video>
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


var player;

window['__onGCastApiAvailable'] = function (isAvailable, reason) {
    if (!isAvailable) {
        $('castDiv').style.display = 'none';
        $('playerControl').style.display = 'none';
        $('castError').innerText = reason;
        return;
    }

    cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });

    player = new cast.framework.RemotePlayer();;
    playerController = new cast.framework.RemotePlayerController(player);
    $('playerControl').hidden = true;
}

function playRemote(path, currentTime, isPaused) {
    path = "http://192.168.2.16:5000" + path
    var session = cast.framework.CastContext.getInstance().getCurrentSession();
    if (session) {
        var content = path;
        var mediaInfo = new chrome.cast.media.MediaInfo(
            path, "video/mp4");

        mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
        mediaInfo.metadata.title = "";
        mediaInfo.metadata.subtitle = "";
        mediaInfo.metadata.images = [];
        var request = new chrome.cast.media.LoadRequest(mediaInfo);
        request.currentTime = currentTime;
        request.autoplay = !isPaused;
        session.loadMedia(request).then(
            function () { console.log('Load succeed'); },
            function (e) { console.log('Load failed ' + e); });
    }
}