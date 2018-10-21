class Pixel {
    constructor(x, y, r, g, b, panel) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.g = g;
        this.b = b;
        this.panel = panel;
    }
}

function getColor(el) {
    var rgb = el.style.background;
    return el.style.background.replace("rgb(","").replace(")","").split(",")
}

function getPixels() {
    let pixels = [];

    for (var x = 0; x < COLS; x++) {
        for (var y = 0; y < ROWS; y++) {

            let id = `c${x}r${y}`;
            let pixel = document.getElementById(id);
            let panel = document.getElementById("panel-input").value
            var rgb = getColor(pixel);

            pixels.push(new Pixel(y, x, rgb[0], rgb[1], rgb[2], panel));
        }
    }
    return pixels;
}

function Apply() {
    var pixels = getPixels();

    //Change to get the endpoint
    post('192.168.2.68/Apply', pixels).then(resp => console.log(resp));
}