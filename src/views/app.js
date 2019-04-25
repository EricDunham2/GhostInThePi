
Vue.config.devtools = true;
new Vue({
    el: "#indexApp",
    data: {
        component: 'home',
        options: {
            cubert:false,
            camera:false
        },
        config: null,
    },
    methods: {
        setComponent(component) {
            this.component = component;
            document.getElementById("sidebar-toggle").checked = false;
        },
    },
    beforeMount() {
        this.component = 'home'
        //this._getConfig();
        //this._getIpAddress();
    }
});
