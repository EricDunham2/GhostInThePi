class Pixel {
    constructor(x, y, r, g, b, panel) {
        this.x = x;
        this.y = y;
        this.id = `[${this.x}, ${this.y}]`
        this.r = r;
        this.g = g;
        this.b = b;
        this.panel = panel;
        this.style = { background: `rgb(${this.r},${this.g},${this.b})` };
    }

    setColor(r,g,b) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.style = { background: `rgb(${this.r},${this.g},${this.b})` };
    }
}

var vm = this;
var ColorPicker = VueColorPicker;

var paintVue = new Vue({
    el: '#paintContent',
    data: {
        rows: 32,
        cols: 32,
        parallels: 1,
        panels: 0,
        mouseDown: false,
        brushSize: 1,
        pixels: null,
        color: {
            hue: 50,
            saturation: 100,
            luminosity: 50,
            alpha: 1
        }
    },
    components: {
        ColorPicker: ColorPicker
    },
    methods: {
        setPixel(pixel) {
            //if (!this.mouseDown) { return; }

            var rgb = hsl2rgb(this.color.hue, this.color.saturation, this.color.luminosity);

            pixel.setColor(rgb.r, rgb.g, rgb.b);
            paintVue.$forceUpdate();
            /*if (this.brushSize > 1) {
                var centerX = pixel.x;
                var centerY = pixel.y;
                var brushRadius = (this.brushSize - 1) / 2;

                for (var i = 0; i < brushRadius; i++) {
                    var px = this.pixels[centerX]
                }

            }*/
        },
       /* setBrushSize(value) {
            if (value % 2 === 0 || value > 5) { return; } //

            brushSize = value
        }*/

       /* _getColor(el) {
            var rgb = el.style.background;
            return rgb.replace("rgb(", "").replace(")", "").split(",")
        },
        _getPixels() {
            let pixels = [];

            let panel_input = document.getElementById("panel-input").value
            if (!panel_input) {
                panel_input = "0"
            } //TODO set this to number of parallel panels

            panels = panel_input.split(",");

            panels.forEach(p => {
                p = parseInt(p);

                for (var x = 0; x < this.cols; x++) {
                    for (var y = 0; y < this.rows; y++) {

                        let id = `c${y}r${x}`;
                        let pixel = document.getElementById(id);
                        var rgb = this._getColor(pixel);

                        pixels.push(new Pixel(x + (p * this.cols), y, parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2])));
                    }
                }
            });
            return pixels;
        },
        apply() {
            var pixels = JSON.stringify(this._getPixels());

            //Use axios
            REST("POST", `http://${self.cubertEndpoint}/apply`, false, pixels).then(handle, handle)

            function handle(result) {
                console.log(result)
            }
        },
        test() {
            var test = JSON.stringify([{
                    "x": 32,
                    "y": 0,
                    "r": 0,
                    "g": 0,
                    "b": 255
                },
                {
                    "x": 64,
                    "y": 0,
                    "r": 255,
                    "g": 0,
                    "b": 160
                },
                {
                    "x": 96,
                    "y": 0,
                    "r": 255,
                    "g": 0,
                    "b": 0
                },
                {
                    "x": 113,
                    "y": 0,
                    "r": 255,
                    "g": 255,
                    "b": 0
                }
            ]);

            //Use axios
            REST("POST", `http://${self.cubertEndpoint}/test`, false, test).then(handle, handle)

            function handle(result) {
                console.log(result)
            }
        },
        rotate() {
            var delay = 100;

            //Use axios
            REST("POST", `http://${self.cubertEndpoint}/rotate`, false, delay).then(handle, handle);

            function handle(result) {
                console.log(result);
            }
        },
        setSelectedPixel(self) {
            if (!mouse_down) { return; }
            self.style.background = document.getElementById("result").style.background;

            if (brushSize > 1) {
                var id = self.id;
            }
            //selectedPixel.push(self);
        },
        clear() {
            var node = document.getElementById("matrix");

            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }

            this.createMatrix(this.cols, this.rows);
        },*/
        createMatrix() {
            this.pixels = {};

            for (var i = 0; i < this.rows; i++) {
                this.pixels[i] = {};
                for (var j = 0; j < this.cols; j++) {
                    this.pixels[i][j] = new Pixel(i, j, 0, 0, 0);
                }
            }
        },
        onInput: function(hue) {
            this.color.hue = hue;
        }
    },
    beforeMount() {

        this.createMatrix();

        document.body.onmousedown = function() {
            this.mouseDown = true;
        }
        
        document.body.onmouseup = function() {
            this.mouseDown = false;
        }

        console.log(this);
    }
});


function hsl2rgb (h, s, l) {

    var r, g, b, m, c, x

    if (!isFinite(h)) h = 0
    if (!isFinite(s)) s = 0
    if (!isFinite(l)) l = 0

    h /= 60
    if (h < 0) h = 6 - (-h % 6)
    h %= 6

    s = Math.max(0, Math.min(1, s / 100))
    l = Math.max(0, Math.min(1, l / 100))

    c = (1 - Math.abs((2 * l) - 1)) * s
    x = c * (1 - Math.abs((h % 2) - 1))

    if (h < 1) {
        r = c
        g = x
        b = 0
    } else if (h < 2) {
        r = x
        g = c
        b = 0
    } else if (h < 3) {
        r = 0
        g = c
        b = x
    } else if (h < 4) {
        r = 0
        g = x
        b = c
    } else if (h < 5) {
        r = x
        g = 0
        b = c
    } else {
        r = c
        g = 0
        b = x
    }

    m = l - c / 2
    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)

    return { r: r, g: g, b: b }

}