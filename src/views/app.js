var self = this;

self.mediaPath = "";
self.cubertEndpoint = "";
self.cameraEndpoint = "";
self.ip = "";

function getConfig() {

    var xhttp = new XMLHttpRequest();
  
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);

            setConfig(this.responseText);
      }
    };
  
    xhttp.open("GET", "/config", true);
    xhttp.send();
}

function setConfig(response) {
    if (!response) { return; } 

    var config = JSON.parse(response);

    self.mediaPath = config.media;
    self.cubertEndpoint = config.cubert;
    self.cameraEndpoint = config.camera;
}

function getIpAddress() {
    var xhttp = new XMLHttpRequest();
  
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        console.log(this.responseText);
        setIpAddress(this.responseText)
      }
    };
  
    xhttp.open("GET", "/getIpAddr", true);
    xhttp.send();
}

function setIpAddress(response) {
    if (!response) { return; } 

    self.ipAddress = response.replace(/"/g,"");
}

function init() {
    getConfig();
    getIpAddress();
}

init()