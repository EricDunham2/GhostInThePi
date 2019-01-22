var vm = this;

new Vue({
    el: '#mediaContent',
    data: {
        media: null,
        selectedFolder: null,
        selectedFile: null,
        mediaPath: null,
        searchPath: "/media/pi/MJRO1801/"
    },
    methods: {
        _getMedia(path) {
            axios
                .post("/media/findMedia", path)
                .then(this._setMedia)
        },
        _setMedia(response) {
            if (!this._validateResponse(response)) { return; }

            try {
                this.media = JSON.parse(response.data);
                console.log(this.media);
            } catch(err) {
                console.log(err);
                return;
            }

            if (!this.media) { return; }

            this._addParentReference(this.media);
            this.selectedFolder = this.media;
        },
        _validateResponse(response) {
            return response && response.status === 200 && response.data
        },
        _addParentReference(parent) {
            if (!parent){ return; }

            parent.Branches.forEach(folder => {
                //if (!folder.parent) { return; }
                folder.parent = parent;
		folder.Name = folder.Name.replace(folder.parent.Path, "");
                //this._addParentReference(parent);
            })
        },
        selectFolder(folder) {
            this._addParentReference(folder);
            this.selectedFolder = folder;
        },
        selectFile(file) {
            this.selectedFile = file;
        },
        closeModal() {
            this.selectedFile = null;
        },
    },
    beforeMount() {
        this._getMedia(this.searchPath);
    }
});

/*function playClick() {
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
}*/
