var vm = this;

Vue.config.devtools = true;

vm.index = new Vue({
    el: "#indexApp",
    data: {
        options: {
            cubert:false,
            camera:false
        },
        config: null,
    },
    methods: {
        _getConfig: function() {
            console.log("Hello")
            axios
                .get("/config")
                .then(this._setConfig)
        },
        _setConfig: function(response) {
            if (!response || !response.data) { return; }
            config = response.data;

            if (config["camera"]) {
                Vue.prototype.$cameraIp = response.data.camera;
                this.options.camera = true;
            }

            if (config["cubert"]) {
                Vue.prototype.$cubertIp = response.data.cubert;
                this.options.cubert = true;
            }
        },
        _getIpAddress: function() {
            axios
                .get("/getIpAddr")
                .then(this._setIpAddr)
        },
        _setIpAddr: function(response) {
            if (!response || !response.data) { return; }
            Vue.prototype.$ipAddress = response.data.replace(/"/g,"");
        }
    },
    beforeMount() {
        this._getConfig();
        this._getIpAddress();
    }
});
