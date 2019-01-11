
var vm = this;
var ColorPicker = VueColorPicker;

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

var paintVue = new Vue({
    el: '#paintContent',
    data: {
        rows: 32,
        cols: 32,
        parallels: 1,
        panels: "0",
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
        setPixelMobile(e) {
            e.stopPropagation();

            this.mouseDown = true;

            if (!e || !e.touches[0]) { return; }

            var target = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
            if (!target || !target.classList.contains("pixel")) { return; }
            let pixel = this.pixels[target.getAttribute("x")][target.getAttribute("y")];
            //var pixel = this.pixels[]

            this.setPixel(pixel);
            this.mouseDown = false;
        },
        setPixel(pixel) {
            if (!this.mouseDown) { return; }

            var rgb = hsl2rgb(this.color.hue, this.color.saturation, this.color.luminosity);
            pixel.setColor(rgb.r, rgb.g, rgb.b);

            if (this.brushSize > 1) {
                var centerX = pixel.x;
                var centerY = pixel.y;
                var brushRadius = (this.brushSize - 1) / 2;

                for (var i = 0; i <= brushRadius; i++) {
                    this.pixels[centerX - i][centerY] ? this.pixels[centerX - i][centerY].setColor(rgb.r, rgb.g, rgb.b) : null;
                    this.pixels[centerX + i][centerY] ? this.pixels[centerX + i][centerY].setColor(rgb.r, rgb.g, rgb.b) : null;

                    for (var j = 0; j <= brushRadius; j++) {
                        this.pixels[centerX + i][centerY - j] ? this.pixels[centerX + i][centerY - j].setColor(rgb.r, rgb.g, rgb.b) : null;
                        this.pixels[centerX + i][centerY + j] ? this.pixels[centerX + i][centerY + j].setColor(rgb.r, rgb.g, rgb.b) : null;
                        this.pixels[centerX - i][centerY - j] ? this.pixels[centerX - i][centerY - j].setColor(rgb.r, rgb.g, rgb.b) : null;
                        this.pixels[centerX - i][centerY + j] ? this.pixels[centerX - i][centerY + j].setColor(rgb.r, rgb.g, rgb.b) : null;
                    }
                }
            }

            paintVue.$forceUpdate();
        },
        setBrushSize() {
            if (this.brushSize % 2 === 0) { this.brushSize = 1; }
        },
        _getPixels() {
            let pkgPixels = [];
            let panelsToApply = this.panels.split(",");

            if (!panelsToApply) { panelsToApply = [0]; }

            panelsToApply.forEach(p => {
                p = parseInt(p);

                for (var x = 0; x < this.cols; x++) {
                    for (var y = 0; y < this.rows; y++) {
                        var mirrorPixel = this.pixels[x][y];
                        pkgPixels.push(new Pixel(x + (p * this.cols), y, mirrorPixel.r, mirrorPixel.g, mirrorPixel.b));
                    }
                }
            });

            return pkgPixels;
        },
        apply() {
            var pkgPixels = JSON.stringify(this._getPixels());

            try {
                axios
                    .post(`http://${self.cubertEndpoint}/apply`, pkgPixels)
                    .then(this._responseHandler);
            } catch (err) {
                toastr(err, "error", 5000)
            }
        },
        _responseHandler(response) {
            if (!this._validateResponse(response)) { toastr(JSON.stringify(response), "error", 5000) }
        },
        _validateResponse(response) {
            return response && response.status === 200 && response.data
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

            axios
                .post(`http://${self.cubertEndpoint}/test`, test)
                .then(this._responseHandler);
        },
        rotate() {
            var delay = 100;

            axios
                .post(`http://${self.cubertEndpoint}/rotate`, delay)
                .then(this._responseHandler);
        },
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

function init() {
    document.body.onmousedown = function() {
        paintVue.mouseDown = true;
    }

    document.body.onmouseup = function() {
        paintVue.mouseDown = false;
    }

    document.body.ontouchstart = function() {
        paintVue.mouseDown = true;
    }

    document.body.ontouchcancel = function() {
        paintVue.mouseDown = false;
    }
}

init();