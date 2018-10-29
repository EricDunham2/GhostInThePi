
const FAILED_REQUEST = 400;
const PASSED_REQUEST = 200;

var video = document.getElementById("stream-video");

function fadeOut(el) {
    var parent = document.getElementsByClassName("portfolio")[0];
    return new Promise((resolve, reject) => {
        var inter = setInterval(function () {
            try {
                var opa = parseFloat(getComputedStyle(el).opacity)
                el.style.opacity = opa - 0.05;
            } catch(err) {
                reject(false)
            }

            if (opa <= 0) {
                clearInterval(inter);
                el.style.display = "none";
                resolve(true);
                //parent.removeChild(el);
            }
        }, 100);
    });
}

function fadeIn(el) {
    return new Promise((resolve, reject) => {
        var inter = setInterval(function () {
            var opa = parseFloat(getComputedStyle(el).opacity)
            el.style.opacity = opa + 0.1;

            if (opa >= 1) {
                clearInterval(inter);
                el.style.display = "initial";
                toastr("The endpoint specified could not be found.")
                resolve(true);
                //body.removeChild(el);
            }
        }, 100);
    });
}

function endpointSubmit(event, el) {
    if (event.keyCode != 13) { return; }
    var endpoint_el = document.getElementById("endpoint");
    var endpoint_group = document.getElementById("endpoint-group");
   
    REST("GET",`http://${endpoint_el.value}/ping`, false).then(handle, handle)

    fadeOut(endpoint_group).then(handle, handle);

    function handle(result) {

        if (!result || result === "") { fadeIn(endpoint_el) }

        if (result.toLowerCase() === "pong") {
            fadeOut(endpoint_group).then(
                function() {
                    video.display = "initial";
                    video.src = `http://${endpoint_el.value}/camera`;
                    video.style.display = "initial";
                }        
            )
        } else {
            fadeIn(endpoint_group);
        }
    }
}

