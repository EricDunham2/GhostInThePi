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

    let panel_input = document.getElementById("panel-input").value
    if (!panel_input) { panel_input = "0"} //TODO set this to number of parallel panels

    panels = panel_input.split(",");

    panels.forEach(p => {
        p = parseInt(p);

        for (var x = 0; x < COLS; x++) {
            for (var y = 0; y < ROWS; y++) {

                let id = `c${y}r${x}`;
                let pixel = document.getElementById(id);
                var rgb = getColor(pixel);

                pixels.push(new Pixel(x + (p * COLS), y, parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2])));
            }
        }
    });

    return pixels;
}

function Apply() {

    var pixels = JSON.stringify(getPixels());

    console.log(`http://${self.cubertEndpoint}/apply`);
    
    REST("POST",`http://${self.cubertEndpoint}/apply`, false, pixels).then(handle, handle)

    function handle(result) {
        console.log(result)
    }
}

function Test() { 
    var test = JSON.stringify([
        {"x":32, "y":0, "r":0, "g":0, "b":255},
        {"x":64, "y":0, "r":255, "g":0, "b":160},
        {"x":96, "y":0, "r":255, "g":0, "b":0},
        {"x":113, "y":0, "r":255, "g":255, "b":0}
    ]);
    
    console.log(`http://${self.cubertEndpoint}/test`);

    REST("POST",`http://${self.cubertEndpoint}/test`, false, test).then(handle, handle)

    function handle(result) {
        console.log(result)
    }
}

function Rotate() {
    var pixels = getPixels();

    console.log(`http://${self.cubertEndpoint}/rotate`);

    REST("GET",`http://${self.cubertEndpoint}/rotate`, false).then(handle, handle);

    function handle(result) {
        console.log(result)
    }
}