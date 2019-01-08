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

            var rgb = hslToRgb(this.color.hue, this.color.saturation, this.color.luminosity);

            pixel.setColor(rgb[0], rgb[1], rgb[2]);
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


function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}