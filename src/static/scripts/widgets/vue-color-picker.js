! function (t, e) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : t.VueColorPicker = e()
}(this, function () {
    "use strict";
    "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self && self;

    function t(t, e) {
        return t(e = {
            exports: {}
        }, e.exports), e.exports
    }
    var e, n, i, o, s, a = t(function (t, e) {
            t.exports = function (t, e) {
                var n = e / 2,
                    i = Math.sqrt(2) * n,
                    o = Math.PI / 180,
                    s = 2 * Math.PI;
                t.width = t.height = e;
                var a = t.getContext("2d"),
                    r = .5 * o + .02;
                a.translate(n, n), a.rotate(-Math.PI / 2), a.translate(-n, -n);
                for (var l = 0; l < 360; l += .5) {
                    a.fillStyle = "hsl(" + l + ", 100%, 50%)", a.beginPath(), a.moveTo(n, n);
                    var u = l * o,
                        h = Math.min(s, u + r);
                    a.arc(n, n, i, u, h), a.closePath(), a.fill()
                }
                return t
            }
        }),
        r = t(function (t, e) {
            t.exports = function () {
                function t(t, e) {
                    for (var n = 0; n < e.length; n++) {
                        var i = e[n];
                        i.enumerable = i.enumerable || !1, i.configurable = !0, "value" in i && (i.writable = !0), Object.defineProperty(t, i.key, i)
                    }
                }
                var e = 180 / Math.PI,
                    n = function (t) {
                        var e = t % 360;
                        return e < 0 ? 360 + e : e
                    },
                    i = function (t, n) {
                        var i = t.x,
                            o = t.y,
                            s = n.left + n.width / 2,
                            a = n.top + n.height / 2;
                        return Math.atan2(o - a, i - s) * e
                    },
                    o = function () {};
                return function () {
                    function e(t, e) {
                        this.active = !1, this._angle = 0, this.element = t, this.element.style.willChange = "transform", this.initOptions(e), this.updateCSS(), this.bindHandlers(), this.addListeners()
                    }
                    var s, a, r, l = e.prototype;
                    return l.initOptions = function (t) {
                        t = t || {}, this.onRotate = t.onRotate || o, this.onDragStart = t.onDragStart || o, this.onDragStop = t.onDragStop || o, this._angle = t.angle || 0
                    }, l.bindHandlers = function () {
                        this.onRotationStart = this.onRotationStart.bind(this), this.onRotated = this.onRotated.bind(this), this.onRotationStop = this.onRotationStop.bind(this)
                    }, l.addListeners = function () {
                        this.element.addEventListener("touchstart", this.onRotationStart, {
                            passive: !0
                        }), document.addEventListener("touchmove", this.onRotated, {
                            passive: !1
                        }), document.addEventListener("touchend", this.onRotationStop, {
                            passive: !0
                        }), document.addEventListener("touchcancel", this.onRotationStop, {
                            passive: !0
                        }), this.element.addEventListener("mousedown", this.onRotationStart, {
                            passive: !0
                        }), document.addEventListener("mousemove", this.onRotated, {
                            passive: !1
                        }), document.addEventListener("mouseup", this.onRotationStop, {
                            passive: !0
                        }), document.addEventListener("mouseleave", this.onRotationStop, {
                            passive: !1
                        })
                    }, l.removeListeners = function () {
                        this.element.removeEventListener("touchstart", this.onRotationStart), document.removeEventListener("touchmove", this.onRotated), document.removeEventListener("touchend", this.onRotationStop), document.removeEventListener("touchcancel", this.onRotationStop), this.element.removeEventListener("mousedown", this.onRotationStart), document.removeEventListener("mousemove", this.onRotated), document.removeEventListener("mouseup", this.onRotationStop), document.removeEventListener("mouseleave", this.onRotationStop)
                    }, l.destroy = function () {
                        this.onRotationStop(), this.removeListeners()
                    }, l.onRotationStart = function (t) {
                        "touchstart" !== t.type && 0 !== t.button || (this.initDrag(), this.onDragStart(t))
                    }, l.onRotationStop = function () {
                        this.active && (this.active = !1, this.onDragStop()), this.active = !1
                    }, l.onRotated = function (t) {
                        if (this.active) {
                            t.preventDefault();
                            var e = t.targetTouches ? t.targetTouches[0] : t;
                            this.updateAngleToMouse({
                                x: e.clientX,
                                y: e.clientY
                            }), this.updateCSS(), this.onRotate(this._angle)
                        }
                    }, l.setAngleFromEvent = function (t) {
                        var e = i({
                            x: t.clientX,
                            y: t.clientY
                        }, this.element.getBoundingClientRect());
                        this._angle = n(e + 90), this.updateCSS(), this.onRotate(this._angle)
                    }, l.updateAngleToMouse = function (t) {
                        var e = i(t, this.element.getBoundingClientRect());
                        this.lastMouseAngle || (this.lastElementAngle = this._angle, this.lastMouseAngle = e), this._angle = n(this.lastElementAngle + e - this.lastMouseAngle)
                    }, l.initDrag = function () {
                        this.active = !0, this.lastMouseAngle = void 0, this.lastElementAngle = void 0
                    }, l.updateCSS = function () {
                        this.element.style.transform = "rotate(" + this._angle + "deg)"
                    }, s = e, (a = [{
                        key: "angle",
                        get: function () {
                            return this._angle
                        },
                        set: function (t) {
                            this._angle !== t && (this._angle = n(t), this.updateCSS())
                        }
                    }]) && t(s.prototype, a), r && t(s, r), e
                }()
            }()
        });
    return e = {
        render: function () {
            var t = this,
                e = t.$createElement,
                n = t._self._c || e;
            return n("div", {
                staticClass: "rcp",
                class: {
                    dragging: t.isDragging, disabled: t.disabled
                },
                attrs: {
                    tabindex: t.disabled ? -1 : 0
                },
                on: {
                    keyup: function (e) {
                        return "button" in e || !t._k(e.keyCode, "enter", 13, e.key, "Enter") ? t.selectColor(e) : null
                    },
                    keydown: [function (e) {
                        return "button" in e || !t._k(e.keyCode, "up", 38, e.key, ["Up", "ArrowUp"]) || !t._k(e.keyCode, "right", 39, e.key, ["Right", "ArrowRight"]) ? "button" in e && 2 !== e.button ? null : (e.preventDefault(), void t.rotate(e, !0)) : null
                    }, function (e) {
                        return "button" in e || !t._k(e.keyCode, "down", 40, e.key, ["Down", "ArrowDown"]) || !t._k(e.keyCode, "left", 37, e.key, ["Left", "ArrowLeft"]) ? "button" in e && 0 !== e.button ? null : (e.preventDefault(), void t.rotate(e, !1)) : null
                    }]
                }
            }, [n("div", {
                ref: "palette",
                staticClass: "rcp__palette",
                class: t.isPaletteIn ? "in" : "out"
            }, [n("canvas")]), t._v(" "), n("div", {
                ref: "rotator",
                staticClass: "rcp__rotator",
                style: {
                    "pointer-events": t.disabled || t.isPressed || !t.isKnobIn ? "none" : null
                },
                on: {
                    dblclick: function (e) {
                        return e.target !== e.currentTarget ? null : t.rotateToMouse(e)
                    }
                }
            }, [n("div", {
                staticClass: "rcp__knob",
                class: t.isKnobIn ? "in" : "out",
                on: {
                    transitionend: t.hidePalette
                }
            })]), t._v(" "), n("div", {
                staticClass: "rcp__ripple",
                class: {
                    rippling: t.isRippling
                },
                style: {
                    borderColor: t.color
                }
            }), t._v(" "), n("button", {
                staticClass: "rcp__well",
                class: {
                    pressed: t.isPressed
                },
                style: {
                    backgroundColor: t.color
                },
                attrs: {
                    type: "button"
                },
                on: {
                    animationend: t.togglePicker,
                    click: t.selectColor
                }
            })])
        },
        staticRenderFns: []
    }, i = void 0, o = !1, (s = ("function" == typeof (n = {
        rcp: null,
        name: "vue-color-picker",
        props: {
            hue: {
                default: 0
            },
            saturation: {
                default: 100
            },
            luminosity: {
                default: 50
            },
            alpha: {
                default: 1
            },
            step: {
                default: 2
            },
            mouseScroll: {
                default: !1
            },
            variant: {
                default: "collapsible"
            },
            disabled: {
                default: !1
            }
        },
        data: function () {
            return {
                isPaletteIn: !0,
                isKnobIn: !0,
                isPressed: !1,
                isRippling: !1,
                isDragging: !1
            }
        },
        computed: {
            color: function () {
                return "hsla(" + this.hue + ", " + this.saturation + "%, " + this.luminosity + "%, " + this.alpha + ")"
            }
        },
        watch: {
            hue: function (t) {
                this.rcp.angle = t
            }
        },
        mounted: function () {
            var t = this;
            this.mouseScroll && this.$refs.rotator.addEventListener("wheel", this.onScroll), getComputedStyle(this.$refs.palette).backgroundImage.includes("conic") || a(this.$refs.palette.firstElementChild, this.$el.offsetWidth || 280), this.rcp = new r(this.$refs.rotator, {
                angle: this.hue,
                onRotate: this.updateColor,
                onDragStart: function () {
                    t.isDragging = !0
                },
                onDragStop: function () {
                    t.isDragging = !1
                }
            })
        },
        methods: {
            onScroll: function (t) {
                !this.isPressed && this.isKnobIn && (t.preventDefault(), t.deltaY > 0 ? this.rcp.angle += this.step : this.rcp.angle -= this.step, this.updateColor(this.rcp.angle))
            },
            rotate: function (t, e) {
                if (!this.disabled && !this.isPressed && this.isKnobIn) {
                    var n = e ? 1 : -1;
                    t.ctrlKey ? n *= 6 : t.shiftKey && (n *= 3), this.rcp.angle += this.step * n, this.updateColor(this.rcp.angle)
                }
            },
            updateColor: function (t) {
                this.$emit("input", t)
            },
            rotateToMouse: function (t) {
                !this.isPressed && this.isKnobIn && this.rcp.setAngleFromEvent(t)
            },
            selectColor: function () {
                this.isPressed = !0, this.isPaletteIn && this.isKnobIn ? (this.$emit("change", this.hue), this.isRippling = !0) : this.isPaletteIn = !0
            },
            togglePicker: function () {
                "persistent" !== this.variant && (this.isKnobIn ? this.isKnobIn = !1 : (this.isKnobIn = !0, this.isPaletteIn = !0)), this.isRippling = !1, this.isPressed = !1
            },
            hidePalette: function () {
                this.isKnobIn || (this.isPaletteIn = !1)
            }
        },
        beforeDestroy: function () {
            this.rcp.destroy(), this.rcp = null
        }
    }) ? n.options : n) || {}).__file = "ColorPicker.vue", s.render || (s.render = e.render, s.staticRenderFns = e.staticRenderFns, s._compiled = !0, o && (s.functional = !0)), s._scopeId = i, s
});
//# sourceMappingURL=vue-color-picker.min.js.map