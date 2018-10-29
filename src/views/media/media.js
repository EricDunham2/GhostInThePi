var self = this;

function init() {
    var mediaInput = document.getElementById("inputPath");
    mediaInput.value = self.mediaPath;

    self.media = null;
    self.parents = [];
    self.elements = {};

    mediaInput.addEventListener("keydown", function (e) {
        if (e.keyCode === 13) {  //checks whether the pressed key is "Enter"
            getMedia(e.target.value);
        }
    });

    getMedia(self.mediaPath);
}

function getMedia(path) {
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var mediafiles = null;
            
            try {
                mediafiles = JSON.parse(this.responseText);
            } catch(err) {
                toastr("No media found", 3000);
                return;
            }

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


    if (!data.Nodes || !data.Nodes.length) {
        toastr("No Nodes Found", 3000);
        return;
    }

    data.Nodes.forEach(file => {
        html = `
                <div class="c_overlay">${file.Name}</div>
                <i class="material-icons icon" onclick="playMedia('${file.Video}')">movie</i>
            `;

        var el = createElement("div", { "class": "media-file", "file-name": file }, html, parent, false);
    });
}

function closeModel() {
    var parent = document.getElementById("video-modal");
    parent.remove();
}

//elem.addEventListener("touchstart", defaultPrevent);
//elem.addEventListener("touchmove" , defaultPrevent);

init();