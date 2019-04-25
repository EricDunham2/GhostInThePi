Vue.component('home', {
      data: function () {
            return {
                  time: null,
                  isActive: false,
                  typed: null
            }
      },
      methods: {
            _getTime() {
                  currentTime = new Date();
                  var hours = (currentTime.getHours() - 12 < 0) ? (currentTime.getHours() === 0) ? '12' : currentTime.getHours() : currentTime.getHours() - 12;
                  var minutes = (currentTime.getMinutes() < 10) ? '0' + currentTime.getMinutes() : currentTime.getMinutes();
                  var seconds = (currentTime.getSeconds() < 10) ? '0' + currentTime.getSeconds() : currentTime.getSeconds();
                  var ampm = (currentTime.getHours() - 12 <= 0) ? 'AM' : 'PM';

                  return `${hours}:${minutes}:${seconds}\t${ampm}`;
            },
      },
      created() {
            setInterval(() => {
                  this.time = this._getTime();
                  //vm.typed = new Typed("#quote", vm.options); 
                  /*if (!this.localAddr) {
                        this.localAddr = Vue.prototype.$ipAddress
                  }*/
            }, 1000);
      },
      template: `
      <div id="homeContent" class="no-touch-top flex-container col-100" >
            <div class="panel col-100">
                  <div class="panel-header">
                  </div>
                  <div class="panel-content vhc" > <!--style="height: 100%;"-->
                  
                        <div class="panel col-100">
                              <div class="panel-header hc">
                              <!--<div id="ipAddr" v-text="localAddr"></div>-->
                              <!--<div id="macAddr"></div>-->
                              </div>
                              <div class="panel-content vhc" style="height:-webkit-fill-available">
                              <!--<div id="network-globe"></div><globe></globe>-->
                              <div class="trim-content-box slogan-box">
                                    <div id="clock" v-text="time"></div>
                              </div>
                              <h3 id="quote"></h3>
                              </div>
                        </div>
                  </div>
            </div>
      </div>
      `
});

/*vm.options = {
      strings: [
            `Welcome!`,
      ],
      typeSpeed: 50,
      smartBackspace: true,
      loop: false,
      loopCount: Infinity,
      startDelay: 500
}

vm.typed = new Typed("#quote", vm.options);*/