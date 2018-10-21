var colorsSystem = document.querySelectorAll(".switch-colors-system .colors-system span");
var container    = document.querySelector(".container_color_picker");
var switchR      = document.querySelector(".switch-colors-system .right");
var switchL      = document.querySelector(".switch-colors-system .left");
var resize       = document.querySelector(".resize");
var picking      = document.querySelector(".picking_color")[0];
var sat          = document.querySelector(".saturation");
var hue          = document.querySelector(".hue");
var satPointer   = document.getElementById("sat_pointer");
var huePointer   = document.getElementById("hue_pointer");
var result       = document.querySelector(".result");
var copied       = document.querySelector(".copied");
var resultColor  = document.querySelector(".color");
var satX         = offset(sat).width;
var HPA          = false;
var SPA          = false;
var color        = [];
var CSA          = 1;
var satY         = 0;
var hueVal       = 0;
var rgb, hsl, hex;
var RGB, HSL, HEX;


function offset(element) {
    'use strict';
    var scrollY = parseInt(element.ownerDocument.defaultView.scrollY);
    var y       = parseInt(element.getBoundingClientRect().top + scrollY);
    var scrollX = parseInt(element.ownerDocument.defaultView.scrollX);
    var x       = parseInt(element.getBoundingClientRect().left);
    var height  = parseInt(element.offsetHeight);
    var width   = parseInt(element.offsetWidth);
    return {x, y, height, width}
}

function hueValue(e) {
    'use strict';
    var y = e.pageY - offset(hue).y;
    huePointer.style.top = Math.max(Math.min(y, offset(hue).height),0) + "px";
    huePointer.classList.add("active");
    hueVal = Math.round(parseInt(huePointer.style.top) / offset(hue).height * 360);
    valuesToHsl();
}

function satValue(e) {
    'use strict';
    var x = e.pageX - offset(sat).x;
    var y = e.pageY - offset(sat).y;
    satPointer.style.left = Math.max(Math.min(x, offset(sat).width), 0) + "px";
    satPointer.style.top = Math.max(Math.min(y, offset(sat).height), 0) + "px";
    satPointer.classList.add("active");
    valuesToHsl();
}

function HslToRgb(h, s, l){
    'use strict';
    var red, blue, green, T1, T2, h, T = [], hue = [];
    var color = ["red","green","blue"];
    var i = 0;
    s > 1 ? s /= 100 : s;
    l > 1 ? l /= 100 : l;
    h = h / 60;
    l <= .5 ? T2 = l * (s + 1) : T2 = l + s - (l * s);
    T1 = l * 2 - T2;
    for (var C in color){
        hue[0] = h + 2;
        hue[1] = h
        hue[2] = h - 2;  
        hue[C] < 0 ? hue[C] += 6 : hue[C] >= 6 ? hue[C] -= 6 : hue[C];
        hue[C] < 1 ? T[C] = (T2 - T1) * hue[C] + T1 : hue[C] < 3 ? T[C] = T2 : hue[C] < 4 ? T[C] = (T2 - T1) * (4 - hue[C]) + T1 : T[C] = T1;
        i++
    }
    red     = Math.round(T[0] * 255);
    green   = Math.round(T[1] * 255);
    blue    = Math.round(T[2] * 255);
    return {red, green, blue}
}

function RgbToHex(r, g, b) {
    'use strict';
    var R = r.toString(16);
    var G = g.toString(16);
    var B = b.toString(16);
    R.length == 1 ? R = "0" + R : R;
    G.length == 1 ? G = "0" + G : G;
    B.length == 1 ? B = "0" + B : B;
    return "#" + R + G + B;
}

function valuesToHsl() {
    'use strict';
    satX = parseInt(satPointer.style.left);
    satY = parseInt(satPointer.style.top);
    var X = satX / offset(sat).width;
    var Y = 1 - (satY / offset(sat).height);
    var lightness;
    typeof(satX) === undefined ? satX = offset(sat).width : satX;
    typeof(satY) === undefined ? satY = 0 : satY;
    hsl = {h:hueVal, s:satX, l:satY};  
    hsl.s = Math.round(satX / offset(sat).width * 100);
    hsl.l = Math.round(lightness = (Y / 2) * (2 - X) * 100);
    console.log(hsl.h,hsl.s,hsl.l);
}

function values() {
    'use strict';
    valuesToHsl();
    var selectedCS   = document.querySelector(".colors-system span[style='opacity: 1;']");
    var hslToRgb = HslToRgb(hsl.h, hsl.s, hsl.l);
    huePointer.style.background = "hsl(" + hsl.h + ", 100%, 50%)";
    HSL =   "hsl(" + hsl.h + ","+ hsl.s + "%" + ","+  hsl.l + "%" + ")";
    RGB =   "rgb(" + hslToRgb.red + "," + hslToRgb.green + "," + hslToRgb.blue + ")";
    HEX =   RgbToHex(hslToRgb.red, hslToRgb.green, hslToRgb.blue);
    sat.style.background = "hsl(" + hsl.h + ", 100%, 50%)";
    satPointer.style.background = HSL;
    result.style.background = "hsl(" + hsl.h + "," + hsl.s + "%" + "," + hsl.l + "%" + ")";
    copied.style.background = "hsl(" + hsl.h + "," + hsl.s + "%" + "," + hsl.l + "%" + ")";
    if (selectedCS.textContent == "HEX"){
        result.innerHTML = HEX.toUpperCase();
        resultColor.value = HEX.toUpperCase();  
    } else if (selectedCS.textContent == "RGB"){
        result.innerHTML = RGB;
        resultColor.value = RGB; 
    } else {
        result.innerHTML = HSL;
        resultColor.value = HSL; 
    }
}

function switchColorSystem(n){
    n < 1 ? CSA = colorsSystem.length : CSA;
    n > colorsSystem.length ? CSA = 1 : CSA;
    for (var i = 0; i < colorsSystem.length; i++) {
        colorsSystem[i].style.opacity = "0";
    }
    colorsSystem[CSA - 1].style.opacity = "1";
}

sat.addEventListener("mousedown", function (e) {
    'use strict';
    SPA = true;
    satValue(e);
    values();
});

hue.addEventListener("mousedown", function (e) {
    'use strict';
    HPA = true;
    hueValue(e);
    values();
});

document.addEventListener("mouseup", function (){
    huePointer.classList.remove("active");
    HPA = false;
    satPointer.classList.remove("active");
    SPA = false;
});

document.addEventListener("mousemove", function (e) {
    'use strict';
    if (HPA) {
        hueValue(e);
        values();
    }
    if (SPA) {
        satValue(e);
        values();
    }
});

result.addEventListener("click", function(){
     'use strict';
    copied.classList.remove("copied-active");
    resultColor.select();
    document.execCommand("copy");
    copied.classList.add("copied-active");

});

switchL.addEventListener("click", function(){
    'use strict';
    switchColorSystem(CSA += 1);
    values();
});

switchR.addEventListener("click", function(){
    'use strict';
    switchColorSystem(CSA += -1);
    values();
});

document.addEventListener("keydown", function(e){
    'use strict';
    var y = parseInt(satPointer.style.top);
    var x = satPointer.style.left;
    x.search('%') > 1 ? x = offset(sat).width : x.search('%') < 1 ? x = parseInt(satPointer.style.left) : x;
    if (e.ctrlKey && e.altKey === false) {
        satPointer.classList.add("active");
        if (e.key === "ArrowRight") {
            x >= offset(sat).width ? x = offset(sat).width : x += 10;
        }
        if (e.key === "ArrowLeft") {
            x <= 0 ? x = 0 : x -= 10;
        }
        if (e.key === "ArrowUp") {
            y <= 0 ? y = 0 : y -= 10;
        }
        if (e.key === "ArrowDown") {
            y >= offset(sat).height ? y = offset(sat).height : y += 10;
        }
    }
    if (e.altKey === false && e.ctrlKey === false) {
        if (e.keyCode === 39) {
            satPointer.classList.add("active");
            x >= offset(sat).width ? x = offset(sat).width : x += (offset(sat).width / 100) * 2;
        }
        if (e.keyCode === 37) {
            satPointer.classList.add("active");
            x <= 0 ? x = 0 : x -= (offset(sat).width / 100) * 2;
        }
        if (e.keyCode === 38) {
            satPointer.classList.add("active");
            y <= 0 ? y = 0 : y -= (offset(sat).height / 100) * 2;
        }
        if (e.keyCode === 40) {
            satPointer.classList.add("active");
            y >= offset(sat).height ? y = offset(sat).height : y += (offset(sat).height / 100) * 2;
        }
    }
    satPointer.style.left = Math.round(x) + "px";
    satPointer.style.top = Math.round(y) + "px";
    values();
});

document.addEventListener("keydown", function(e){
    'use strict';
    var y = parseInt(huePointer.style.top);
    if (e.altKey && e.ctrlKey === false) {
        huePointer.classList.add("active");
        if (e.key === "ArrowUp") {
            y <= 0 ? y = 0 : y -= 1;
        }
        if (e.key === "ArrowDown") {
            y >= offset(hue).height ? y = offset(hue).height : y += 1;
        }
        hueValue(e);
    }
    if (e.altKey && e.ctrlKey) {
        huePointer.classList.add("active");
        if (e.key === "ArrowUp") {
            y <= 0 ? y = 0 : y -= 10;
        }
        if (e.key === "ArrowDown") {
            y >= offset(hue).height ? y = offset(hue).height : y += 10;
        }
        hueValue(e);
    }
    huePointer.style.top = Math.round(y) + "px";
});

document.addEventListener("keyup", function(e){
    'use strict';
    if (e.altKey === false && e.ctrlKey === false) {
        huePointer.classList.remove("active");
    }
    if (e.altKey === false && e.ctrlKey) {
        huePointer.classList.remove("active");
    }
    if (e.ctrlKey === false && e.altKey) {
        satPointer.classList.remove("active");
    }
    if (e.altKey && e.ctrlKey){
        satPointer.classList.remove("active");
    }  
});

var R = false;

document.addEventListener("mouseup", function (e) {
    'use strict';
    R = false
});

document.addEventListener("mousemove", function (e) {
    'use strict';
    if (R){
        var width = e.pageX - Math.abs(offset(container).x);
        var height = e.pageY - Math.abs(offset(container).y);
        if (width < 500) {
            width = 500;
        }
        if (height < 680) {
            height = 680;
        } 
        if (width > 800) {
            width = 800;
        }
        if (height > 748) {
            height = 748;
        }
        container.style.width = width + 'px';
        container.style.height = height + 'px';
    }
});