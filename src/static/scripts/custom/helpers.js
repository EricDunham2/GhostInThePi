function createElement(type, attrsMap, htmlTemplate, parent, retParent) {
    var el = document.createElement(type);
    var attributes = Object.keys(attrsMap);

    attributes.forEach(attr => {
        el.setAttribute(attr, attrsMap[attr]);
    });

    if (htmlTemplate) {
        el.innerHTML = htmlTemplate;
    }

    if (parent) {
        parent.appendChild(el);
    }

    if (!retParent || !parent) {
        return el;
    } else {
        return retParent;
    }
}

function post(url = ``, data = {}) {
    // Default options are marked with *
    return fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            // "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
        .then(response => response.json()); // parses response to JSON
}

$(function () {
    $(".input-group input").focus(function () {
        $(this).parent(".input-group").each(function () {
            $("label", this).css({
                "font-size": "13px",
                "color": "#04f886"
            })
        })
    }).blur(function () {
        if ($(this).val() === "") {

            $(this).css({ 
                "background": "#333333",
            })

            $(this).parent(".input-group").each(function () {
                $("label", this).css({
                    "font-size": "18px",
                })
            });
        } else {
            $(this).css({ 
                "box-shadow": "none",
                "background": "#111111",
            })

            $(this).parent(".input-group").each(function() {
                $("label", this).css({
                    "color": "#CC14AB"
                })
            })
        }
    });

    if ($(".input-group input").val() !== "") {
        $(".input-group input").focus();
        $(".input-group input").blur();
    }
});

function toastr(message, type, timeout) {
    var body = document.getElementsByTagName("body")[0];

    var t = document.createElement("div");
    t.setAttribute("class", `toast ${type} vhc tc`);
    t.innerHTML = message;

    body.appendChild(t);

    setTimeout(function () {
        removeToast(t);
    }, timeout)
}


function removeToast(el) {
    return new Promise((resolve, reject) => {
        var body = document.getElementsByTagName("body")[0];
        var inter = setInterval(function () {
            var opa = parseFloat(getComputedStyle(el).opacity)
            el.style.opacity = opa - 0.05;

            if (opa <= 0) {
                clearInterval(inter);
                body.removeChild(el);
                resolve(true);
            }
        }, 100);
    });
}

function fadeOut(el) {
    return new Promise((resolve, reject) => {
        var inter = setInterval(function () {
            var opa = parseFloat(getComputedStyle(el).opacity)
            el.style.opacity = opa - 0.05;

            if (opa <= 0) {
                clearInterval(inter);
                el.style.display = "none";
                resolve(true);
                //body.removeChild(el);
            }
        }, 100);
    });
}

function fadeIn(el) {
    //var body = document.getElementsByTagName("body")[0];
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