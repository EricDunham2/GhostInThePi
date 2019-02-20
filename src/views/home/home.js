var vm = this; 

vm.home = new Vue( {
      el:'#homeContent', 
      data: {
            time:null, 
            localAddr:Vue.prototype.$ipAddress, 
            isActive:false, 
            typed:null
      }, 
      methods: {
            _getTime() {
                  currentTime = new Date(); 
                  var hours = (currentTime.getHours() - 12 < 0)?(currentTime.getHours() === 0)?'12':currentTime.getHours():currentTime.getHours() - 12; 
                  var minutes = (currentTime.getMinutes() < 10)?'0' + currentTime.getMinutes():currentTime.getMinutes(); 
                  var seconds = (currentTime.getSeconds() < 10)?'0' + currentTime.getSeconds():currentTime.getSeconds(); 
                  var ampm = (currentTime.getHours() - 12 <= 0)?'AM':'PM'; 
            
                  return `$ {hours}:$ {minutes}:$ {seconds}$ {ampm}`; 
            }, 
      }, 
      created() {
            Vue.prototype.$homeActive = true; 

            setInterval(() =>  {
                  this.time = this._getTime();
                  vm.options.strings.push(this.time);
                  //vm.typed = new Typed("#quote", vm.options); 
                  if ( ! this.localAddr) {
                        this.localAddr = Vue.prototype.$ipAddress
                  }
            }, 1000);
      }, 
      beforeDestroy() {
            Vue.prototype.$homeActive = false; 
      }
}); 

vm.options = {
      strings:[
            `Welcome!`,
      ],
      typeSpeed:50, 
      smartBackspace:true, 
      loop:false, 
      loopCount:Infinity,
      startDelay:500
}

vm.typed = new Typed("#quote", vm.options); 


