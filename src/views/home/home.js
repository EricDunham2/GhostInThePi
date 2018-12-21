var vm = this; 

vm.home = new Vue({
      el:'#homeContent',
      data: {
            time: null,
            localAddr: Vue.prototype.$ipAddress
      }, 
      methods: {
            _getTime:function() {
                  currentTime = new Date(); 
                  var hours = (currentTime.getHours() - 12 < 0)?(currentTime.getHours() === 0)?'12':currentTime.getHours():currentTime.getHours() - 12; 
                  var minutes = (currentTime.getMinutes() < 10)?'0' + currentTime.getMinutes():currentTime.getMinutes(); 
                  var seconds = (currentTime.getSeconds() < 10)?'0' + currentTime.getSeconds():currentTime.getSeconds(); 
                  var ampm = (currentTime.getHours() - 12 <= 0)?'AM':'PM';
            
                  return `${hours}:${minutes}:${seconds} ${ampm}`;
            }
      }, 
      created() {
            setInterval(() =>  {
                  this.time = this._getTime();
                  if (!this.localAddr) {
                        this.localAddr = Vue.prototype.$ipAddress
                  }
            }, 1000);
      }
}); 
