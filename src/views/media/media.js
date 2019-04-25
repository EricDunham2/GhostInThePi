Vue.component('media', {
    data: function () {
        return {
            media: null,
            selectedFolder: null,
            selectedFile: null,
            mediaPath: null,
            searchPath: "C:\\Users\\edunham4\\Downloads",
            searchTerm: "",
            indexed: {},
            isActive: false,
        }
    },
    methods: {
        _getMedia(path) {
            axios
                .post("/media/findMedia", path)
                .then(this._setMedia)
        },
        _setMedia(response) {
            console.log(response);

            if (!this._validateResponse(response)) {
                toastr("No Media Found.", null, 1000);
                return;
            }

            this.media = JSON.parse(response.data);

            this.media.search = [];
            this._massageMedia();

        },
        _massageMedia() {
            this._addParentReference(this.media);
            this.selectedFolder = this.media;
            this._indexNodes(this.media);
        },
        _validateResponse(response) {
            return response && response.status === 200 && response.data;
        },
        _addParentReference(parent) {
            if (!parent) {
                return;
            }

            parent.Branches.forEach(folder => {
                folder.parent = parent;
                folder.Name = folder.Name.replace(folder.parent.Path, "");
                if (!folder.parent) {
                    return;
                }
                //this._addParentReference(parent);
            });
        },
        _indexNodes(branch) {
            if (branch.Nodes) {
                branch.Nodes.forEach(node => {
                    this.indexed[node.Name] = node;
                });
            }

            if (branch.Branches) {
                branch.Branches.forEach(b => {
                    this._indexNodes(b);
                });
            }
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
        search() {
            this.media.search = [];

            if (this.searchTerm == "") {
                return;
            }

            var filtered = Object.keys(this.indexed).filter(key => {
                return (key.toLowerCase().indexOf(this.searchTerm.toLowerCase()) != -1);
            });

            filtered.forEach(key => {
                this.media.search.push(this.indexed[key]);
            });
        },
        isMedia(filename) {
            return (filename.indexOf(".mp4") !== -1 || filename.indexOf(".avi") !== -1) ? true : false;
        },
        isText(filename) {
            return (filename.indexOf(".txt") !== -1 || filename.indexOf(".xml") !== -1 || filename.indexOf(".csv") !== -1 || filename.indexOf(".go") !== -1 || filename.indexOf(".js") !== -1) ? true : false;
        },
        isImage(filename) {
            return (filename.indexOf(".jpg") !== -1 || filename.indexOf(".png") !== -1) ? true : false;
        }
    },
    beforeMount() {
        if (this.media) {
            return;
        }

        this._getMedia(this.searchPath);
    },
    beforeDestroy() {},
    watch: {
        searchTerm() {
            this.search();
        },
    },
    template: `
        <div class="flex-container col-100 hc" id="mediaContent" style="height:fit-content;">
            <h3 id="quote" v-if="selectedFolder"></h3>
            <div class="panel col-90">
                <!--<div class="panel-content col-80" style="margin: 10px auto;" v-if="!selectedFolder.parent">
                        <div class="col-100 tc" style="color:#00ff95;" >Search</div>
                        <input class="col-100 dyn-input tc" style="padding:0; height: 30px; font-size: 25px; background: #222; border-radius:25px;" v-model="searchTerm"  />
                    </div>-->
                <div class="panel-content col-100 hc" id="file-browser" style="color:blueviolet;">
                    <div class="tile-md l3 clickable no-touch-table action shadow"
                        v-on:click="selectFolder(selectedFolder.parent)" v-if="selectedFolder.parent" v-cloak>
                        <div class="panel col-100">
                            <div class="panel-header col-80">
                                <div>..</div>
                            </div>
                            <div class="panel-content hc">
                                <i class="material-icons icon-md vhc">arrow_back</i>
                            </div>
                        </div>
                    </div>
                    <div class="tile-md l5 clickable no-touch-table shadow" v-if="searchTerm == ''"
                        v-for="folder in selectedFolder.Branches" v-on:click="selectFolder(folder)" v-cloak>
                        <div class="panel col-100">
                            <div class="panel-header col-80 hc">
                                <div style="margin-top: 5px; " v-text="folder.Name"></div>
                            </div>
                            <div class="panel-content hc">
                                <i class="material-icons icon-md vhc" style="color:#9a9997;">folder</i>
                            </div>
                        </div>
                    </div>
                    <div class="tile-md l5 clickable no-touch-table shadow" v-if="searchTerm == ''"
                        v-for="file in selectedFolder.Nodes" v-cloak v-on:click="selectFile(file)">
                        <div class="panel col-100">
                            <div class="panel-header col-80 hc">
                                <div v-text="file.Name" style="margin-top: 5px;"></div>
                            </div>
                            <div class="panel-content hc" style="color:#9a9997;">
                                <i class="material-icons icon-md vhc" v-if="isMedia(file.Name)">movie</i>
                                <i class="material-icons icon-md vhc" v-if="!isMedia(file.Name)">insert_drive_file</i>
                            </div>
                        </div>
                    </div>
                    <div class="tile-md l5 clickable no-touch-table shadow" v-if="searchTerm != ''" v-for="file in media.search"
                        v-on:click="selectFile(file)" v-cloak>
                        <div class="panel col-100">
                            <div class="panel-header col-80 hc">
                                <div v-text="file.Name" margin-top: 5px;"></div>
                            </div>
                            <div class="panel-content hc" style="color:#9a9997;">
                                <i class="material-icons icon-md vhc" v-if="!isMedia(file.Name)">insert_drive_file</i>
                                <i class="material-icons icon-md vhc" v-if="file.Name.index">movie</i>
                            </div>
                        </div>
                    </div>
                    <div v-if="selectedFile && (isImage(selectedFile.Name) || isText(selectedFile.Name) || isMedia(selectedFile.Name))" style="position:fixed; top:0; left:0; background: black; width:100vw; height:100vh;" v-cloak>
                    <div v-if="isImage(selectedFile.Name)" class="vhc" style="height:100vh; width:100vw; position:absolute; top:0; left:0; z-index:1000;">
                        <div class="modal-close" v-on:click="closeModal()">x</div>
                        <img v-bind:src="selectedFile.Video" style="height:80%; width:80%; color: white;" v-cloak>
                    </div>
                    <div v-if="isText(selectedFile.Name)" class="vhc" style="height:100vh; width:100vw; position:absolute; top:0; left:0; z-index:1000;">
                        <div class="modal-close" v-on:click="closeModal()">x</div>
                        <embed v-bind:src="selectedFile.Video" style="height:80%; width:80%; color: white;" v-cloak>
                    </div>
                    <div v-if="isMedia(selectedFile.Name)" class="flex-container col-100" style="height:100vh; position:absolute; top:0; left:0; z-index:1000;">
                        <div class="modal-close" v-on:click="closeModal()">x</div>
                            <div class="media-player col-100 l2" style="background:black;">
                                <video class="video-player" id="video" :src="selectedFile.Video" controls></video>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
        </div>
    `
});