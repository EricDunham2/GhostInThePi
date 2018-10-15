function getMacAddress() {
    var xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("macAddr").innerHTML = this.responseText.replace(/"/g, "");
      }
    };

    xhttp.open("GET", "/home/getMacAddr", true);
    xhttp.send();
}

function getIpAddress() {
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById("ipAddr").innerHTML = this.responseText.replace(/"/g, "");
    }
  };

  xhttp.open("GET", "/home/getIpAddr", true);
  xhttp.send();
}

function init() {
    getMacAddress();
    getIpAddress();
}

init();