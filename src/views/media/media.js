var vm = this; 

new Vue( {
    el:'#mediaContent', 
    data: {
        media:null, 
        selectedFolder:null, 
        selectedFile:null, 
        mediaPath:null, 
        searchPath:"C:\\Users\\edunham4\\Downloads",
        searchTerm: "",
        indexed: {},
        isActive: false,
    },
    methods: {
        _getMedia(path) {
            axios
                .post("/media/findMedia", path)
                .then(this._setMedia)
        },
        _setMedia(response) {
            if ( ! this._validateResponse(response)) {return;}

            try {
                this.media = JSON.parse(response.data);
                this.media.search = [];
            }catch(err) {
                console.log(err);
                return;
            }

            if (!this.media) {return;}

            this._addParentReference(this.media);
            this.selectedFolder = this.media;
            this._indexNodes(this.media);
        }, 
        _validateResponse(response) {
            return response && response.status === 200 && response.data
        }, 
        _addParentReference(parent) {
            if (!parent) {return;}

            parent.Branches.forEach(folder => {
                folder.parent = parent; 
                folder.Name = folder.Name.replace(folder.parent.Path, "");
                if (!folder.parent) { return; }
                //this._addParentReference(parent);
            })
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

            if (this.searchTerm == "") { return; }

            var filtered = Object.keys(this.indexed).filter(key => {
                return (key.toLowerCase().indexOf(this.searchTerm.toLowerCase()) != -1);
            });

            filtered.forEach(key => {
                this.media.search.push(this.indexed[key]);
            });
        }
    }, 
    beforeMount() {
        this._getMedia(this.searchPath);
        Vue.prototype.$mediaActive = true;
    },
    beforeDestroy() {
        Vue.prototype.$mediaActive = false;
    },
    watch: {
        searchTerm() {
            this.search();
        },
    }
});