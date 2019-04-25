
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

Vue.component('cubert', {
    data: function() {
        return {
            rows: 32,
            cols: 32,
            parallels: 1,
            panels: "0",
            mouseDown: false,
            brushSize: 1,
            pixels: null,
            gBrush: false,
            stopHue: 170,
            circularGradient: false,
            color: {
                hue: 0,
                saturation: 100,
                luminosity: 50,
                alpha: 1
            }
        }
    },
    components: {
        ColorPicker: ColorPicker
    },
    methods: {
        setPixelMobile(e) {
            e.preventDefault();

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

            var h = this.color.hue;

            if (this.gBrush) { h = this.gradientBrush(pixel); }

            var rgb = hsl2rgb(h, this.color.saturation, this.color.luminosity);


            pixel.setColor(rgb.r, rgb.g, rgb.b);
    
            if (this.brushSize > 1) {
                var centerX = pixel.x;
                var centerY = pixel.y;
                var brushRadius = (this.brushSize - 1) / 2;

                for (var i = 0; i <= brushRadius; i++) {

                    this.pixels[centerX - i] && this.pixels[centerX - i][centerY] ? this.pixels[centerX - i][centerY].setColor(rgb.r, rgb.g, rgb.b) : null;
                    this.pixels[centerX + i] && this.pixels[centerX + i][centerY] ? this.pixels[centerX + i][centerY].setColor(rgb.r, rgb.g, rgb.b) : null;

                    for (var j = 0; j <= brushRadius; j++) {

                        if (this.pixels[centerX + i]) {
                            if (this.pixels[centerX + i][centerY + j]) {
                               
                                if (this.gBrush) {
                                    h = this.gradientBrush(this.pixels[centerX + i][centerY + j]);
                                    rgb = hsl2rgb(h, this.color.saturation, this.color.luminosity);
                                }

                                this.pixels[centerX + i][centerY + j].setColor(rgb.r, rgb.g, rgb.b)
                            }

                            if (this.pixels[centerX + i][centerY - j]) {

                                if (this.gBrush) {
                                    h = this.gradientBrush(this.pixels[centerX + i][centerY - j]);
                                    rgb = hsl2rgb(h, this.color.saturation, this.color.luminosity);
                                }

                                this.pixels[centerX + i][centerY - j].setColor(rgb.r, rgb.g, rgb.b)
                            }
                        }

                        if (this.pixels[centerX - i]) {
                            if (this.pixels[centerX - i][centerY + j]) {

                                if (this.gBrush) {
                                    h = this.gradientBrush(this.pixels[centerX - i][centerY + j]);
                                    rgb = hsl2rgb(h, this.color.saturation, this.color.luminosity);
                                }

                                this.pixels[centerX - i][centerY + j].setColor(rgb.r, rgb.g, rgb.b)

                            }

                            if (this.pixels[centerX - i][centerY - j]) {

                                if (this.gBrush) {
                                    h = this.gradientBrush(this.pixels[centerX - i][centerY - j]);
                                    rgb = hsl2rgb(h, this.color.saturation, this.color.luminosity);
                                }

                                this.pixels[centerX - i][centerY - j].setColor(rgb.r, rgb.g, rgb.b)
                            }
                        }
                    }
                }
            }

            paintVue.$forceUpdate();
        },
        setBrushSize() {
            if (this.brushSize % 2 === 0) { this.brushSize = 1; }
        },
        gradientBrush(pixel) {
            var hueDelta = (this.stopHue > this.color.hue) ? this.stopHue - this.color.hue : this.color.hue - this.stopHue;
            var newHue = pixel.x * (hueDelta / this.rows) + this.color.hue;

            if (this.circularGradient) {
                var h = this.rows / 2;
                var x = pixel.x;

                if (pixel.x > h) {
                    //To tired and sick to think of math and a better solution.
                    x = Math.abs(Math.abs(h - pixel.x) - 16);
                } 

                newHue = this.color.hue - (x * ((hueDelta) / (this.rows / 2)));
            }

            if (newHue > 360) { newHue = newHue - 360; }
            if (newHue < 360) { newHue = newHue + 360; }

            console.log(newHue);

            return newHue;
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
                    .post(`http://${Vue.prototype.$cubertIp}/apply`, pkgPixels)
                    .then(this._responseHandler);
            } catch (err) {
                //toastr(err, "error", 5000)
            }
        },
        _responseHandler(response) {
            if (!this._validateResponse(response)) { console.log(response); }//toastr(JSON.stringify(response), "error", 5000) }
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
                .post(`http://${Vue.prototype.$cubertIp}/test`, test)
                .then(this._responseHandler);
        },
        rotate() {
            var delay = 100;

            axios
                .post(`http://${Vue.prototype.$cubertIp}/rotate`, delay)
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
    },
    template: `
    <div>
  <div class="hc col-100 flex-container" id="paintContent">
    <div class="panel col-80">
      <div class="panel col-50 pull-left">
        <div class="panel-header">Configuration</div>
        <div class="panel-content">
          <div class="input-group">
            <label for="rows" class="dyn-input-label" id="rows-label">Rows</label>
            <input type="text" id="rows-setting" name="rows" class="dyn-input" v-model="rows" />
          </div>
          <div class="input-group">
            <label for="cols" class="dyn-input-label" id="cols-label">Cols</label>
            <input type="text" id="cols-setting" name="cols" class="dyn-input" v-model="cols" />
          </div>
          <div class="input-group">
            <label for="parallel" class="dyn-input-label" id="parallel-label">Parallel</label>
            <input type="text" id="parallel-setting" name="parallel" class="dyn-input" v-model="parallels" />
          </div>
          <div class="input-group">
            <label for="parallel" class="dyn-input-label" id="panel-label">Panels</label>
            <input type="text" placeholder="0,1,2,3" id="panel-input" type="text" name="parallel" class="dyn-input"
              v-model="panels" />
          </div>
        </div>
      </div>
      <div class="panel col-50 pull-right">
        <div class="panel-header">Paint Options</div>
        <div class="panel-content">
          <div class="input-group">
            <label for="brush" class="dyn-input-label" id="brush-label">Brush Size</label>
            <input type="text" placeholder="1" type="number" min="1" max="3" id="brush" v-on:change="setBrushSize()"
              name="parallel" class="dyn-input" v-model="brushSize" />
          </div>
          <div class="input-group">
            <label for="hue" class="dyn-input-label" id="sHue-label">Hue</label>
            <input type="text" placeholder="1" type="number" min="0" max="360" id="hue" name="hue" class="dyn-input"
              v-model="color.hue" />
          </div>
          <div class="input-group" v-show="gBrush">
            <label for="sHue" class="dyn-input-label" id="sHue-label" title="Only used when gradient brush is selected">Gradient Stop Hue</label>
            <input type="text" placeholder="1" type="number" min="0" max="360" id="sHue" name="sHue" class="dyn-input"
              v-model="stopHue" />
          </div>
          <div class="input-group" v-show="gBrush">
            <div>
              <label for="cGradient" class="dyn-input-label" id="cGradient-label">Circular Gradient</label>
              <label class="chmk-container vhc">
                <input type="checkbox" v-model="circularGradient" class="cb">
                <span class="checkmark"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="panel col-50">
      <div class="panel-header vhc">
        <span>Actions</span>
      </div>
      <div class="panel-content vhc">
        <div class="btn vhc l3" v-on:click="createMatrix()">
          <span class="tc">New</span>
        </div>
        <div class="btn vhc l3" v-on:click="apply()">
          <span class="tc">Apply</span>
        </div>
        <div class="btn vhc l3" v-on:click="test()">
          <span class="tc">Gradient</span>
        </div>
        <div class="btn vhc l3" v-on:click="test()">
          <span class="tc">Test</span>
        </div>
        <div class="vhc">
          <input id="rotating" type="checkbox" role="button" class="toggle-btn" v-on:click="rotate()" />
          <label for="rotating" class="toggle-lbl vhc l3"><span class="tc">Rotate</span></label>
        </div>
        <div class="vhc">
            <input id="graBrush" type="checkbox" role="button" class="toggle-btn" v-model="gBrush"/>
            <label for="graBrush" class="toggle-lbl vhc l3" style="font-size:15px;"><span class="tc">Grad Brush</span></label>
          </div>
      </div>
    </div>
    <div class="panel col-80">
      <div class="panel-header"></div>
      <div class="panel-content hc">
        <div class="panel col-50">
          <div class="panel-content vhc col-100" style="height:80px;">
            <div>Luminance</div>
            <div class="range-slider hc">
              <input class="range-slider__range" type="range" value="100" min="0" max="100" v-model="color.luminosity">
            </div>
          </div>
          <div class="panel-content hc">
            <color-picker v-bind="color" @input="onInput"></color-picker>
          </div>
        </div>
        <div class="panel col-100">
          <div class="panel-header"></div>
          <div class="panel-content hc">
            <div id="matrix" class="matrix hc" v-on:touchmove="setPixelMobile($event)">
              <div v-for="row in pixels" class="row hc col-100">
                <div v-for="pixel in row" v-bind:x="pixel.x" v-bind:y="pixel.y" class="pixel" v-bind:style="pixel.style"
                  :key="pixel.id" v-on:mouseover="setPixel(pixel)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
    `

});

/*function init() {
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

init();*/
