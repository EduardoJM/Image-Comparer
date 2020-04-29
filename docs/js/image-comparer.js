/**
 * Materialize Image Comparer - A little plugin that implements a image comparer (based on MetroUI) to Materializecss framework.
 * @version v1.0.1
 * @author Eduardo Oliveira (EduardoJM) <eduardo_y05@outlook.com>.
 * @link https://github.com/EduardoJM/Materialize-Image-Comparer
 * 
 * Licensed under the MIT License (https://github.com/EduardoJM/Materialize-Image-Comparer/blob/master/LICENSE).
 */

"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ImageCompare = /*#__PURE__*/function () {
  /**
   * Constructor for Image Compare.
   * @param {HTMLElement} elem - Element in wich Image Compare will be initialized.
   * @param {object} options - Image Compare Options.
   * @param {string or number} options.width - The component width.
   * @param {string or number} options.height - The component height.
   * @param {string} options.sliderClass - The component slider class.
   * @param {string} options.sliderContent - The component slider content.
   * @param {function} options.onResize - The resize event callback.
   * @param {function} options.onSliderMove - The slider move event callback.
   */
  function ImageCompare(elem) {
    var _this = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, ImageCompare);

    _defineProperty(this, "_moveAll", function (e) {
      var w = _this._utilGetWidth(_this.element);

      var x = _this._utilGetCursorPosition(_this.element, e).x;

      if (x < 0) {
        x = 0;
      }

      if (x > w) {
        x = w;
      }

      _this.containerOverlay.style.width = "".concat(x, "px");
      var left_pos = x - _this._utilGetWidth(_this.slider) / 2;
      _this.slider.style.left = "".concat(left_pos, "px");

      if (_this.options.onSliderMove != null && _this.options.onSliderMove !== undefined) {
        _this.options.onSliderMove(x, left_pos, _this.slider);
      }
    });

    _defineProperty(this, "_stopAll", function (e) {
      document.removeEventListener('mousemove', _this._moveAll);
      document.removeEventListener('touchmove', _this._moveAll);
    });

    _defineProperty(this, "_startAll", function (e) {
      document.addEventListener('mousemove', _this._moveAll);
      document.addEventListener('touchmove', _this._moveAll);
      document.addEventListener('mouseup', _this._stopAll);
      document.addEventListener('touchend', _this._stopAll);
    });

    _defineProperty(this, "_resize", function () {
      var _this$_applySizeCompl = _this._applySizeComplete(),
          element_width = _this$_applySizeCompl.element_width,
          element_height = _this$_applySizeCompl.element_height;

      if (_this.options.onResize != null && _this.options.onResize !== undefined) {
        _this.options.onResize(element_width, element_height, _this.element);
      }
    });

    _defineProperty(this, "_utilGetCursorPosition", function (el, e) {
      var a = el.getBoundingClientRect();
      var px = e.changedTouches ? e.changedTouches[0].pageX : e.pageX;
      var py = e.changedTouches ? e.changedTouches[0].pageY : e.pageY;
      return {
        x: px - a.left - window.pageXOffset,
        y: py - a.top - window.pageYOffset
      };
    });

    _defineProperty(this, "_utilRandomInt", function (from, to) {
      return Math.floor(Math.random() * (to - from + 1) + from);
    });

    _defineProperty(this, "_utilGenerateId", function (prefix) {
      var time = new Date().getTime();

      var rand = _this._utilRandomInt(1, 1000);

      return "".concat(prefix, "-").concat(time).concat(rand);
    });

    this.options = Object.assign({
      width: '100%',
      height: 'auto',
      sliderClass: '',
      sliderContent: '',
      onResize: null,
      onSliderMove: null
    }, options);
    this.element = elem;

    this._setOptionsFromDOM();

    this._create();
  }
  /**
   * Set the options from DOM data-*
   */


  _createClass(ImageCompare, [{
    key: "_setOptionsFromDOM",
    value: function _setOptionsFromDOM() {
      var datasetKeys = Object.keys(this.element.dataset);

      for (var i = 0; i < datasetKeys.length; i += 1) {
        var key = datasetKeys[i];

        if (Object.prototype.hasOwnProperty.call(this.options, key)) {
          var value = this.element.dataset[key];

          try {
            this.options[key] = JSON.parse(value);
          } catch (e) {
            this.options[key] = value;
          }
        }
      }
    }
    /**
     * Create the Component.
     */

  }, {
    key: "_create",
    value: function _create() {
      this._createStructure();

      this._createEvents();
    }
    /**
     * Compute and apply the sizes to the component structure.
     */

  }, {
    key: "_applySize",
    value: function _applySize() {
      // set the element width
      if (this.options.width.toString().endsWith('%') || this.options.width.toString().endsWith('px')) {
        this.element.style.width = this.options.width;
      } else {
        this.element.style.width = "".concat(this.options.width, "px");
      } // get parsed width


      var element_width = this._utilGetWidth(this.element); // compute and set the element height


      var element_height = parseInt(this.options.height);

      if (this.options.height === '16/9' || this.options.height === '21/9' || this.options.height === '4/3') {
        element_height = this._utilAspectRatioH(element_width, this.options.height);
      } else if (this.options.height === 'auto') {
        element_height = this._utilAspectRatioH(element_width, "16/9");
      }

      this.element.style.height = "".concat(element_height, "px");
      return {
        element_width: element_width,
        element_height: element_height
      };
    }
    /**
     * Compute and apply the sizes to the component structure
     * and to the child images and reposition the slider to center.
     */

  }, {
    key: "_applySizeComplete",
    value: function _applySizeComplete() {
      var _this$_applySize = this._applySize(),
          element_width = _this$_applySize.element_width,
          element_height = _this$_applySize.element_height; // console.log(element_height);
      // resize the images


      var images = this.element.querySelectorAll('.image-wrapper');
      images.forEach(function (element) {
        element.style.width = "".concat(element_width, "px");
        element.style.height = "".concat(element_height, "px");
      }); // resize the container overlay

      this.containerOverlay.style.width = "".concat(element_width / 2, "px"); // reposition the slider

      var slider_top = element_height / 2 - this._utilGetHeight(this.slider) / 2;
      var slider_left = element_width / 2 - this._utilGetWidth(this.slider) / 2;
      this.slider.style.top = "".concat(slider_top, "px");
      this.slider.style.left = "".concat(slider_left, "px");
      return {
        element_width: element_width,
        element_height: element_height
      };
    }
    /**
     * Create the Component Structure.
     */

  }, {
    key: "_createStructure",
    value: function _createStructure() {
      var _this2 = this;

      var id = this.element.getAttribute('id');

      if (id == null || id === undefined || id === "") {
        id = this._utilGenerateId('image-compare');
        this.element.setAttribute("id", id);
      } // add image-compare to element classList


      this.element.classList.add("image-compare");

      var _this$_applySize2 = this._applySize(),
          element_width = _this$_applySize2.element_width,
          element_height = _this$_applySize2.element_height; // create the container and overlay and append to element


      this.container = document.createElement('div');
      this.container.classList.add('image-container');
      this.element.append(this.container);
      this.containerOverlay = document.createElement('div');
      this.containerOverlay.classList.add('image-container-overlay');
      this.containerOverlay.style.width = "".concat(element_width / 2, "px");
      this.element.append(this.containerOverlay); // create the slider and append to element

      this.slider = document.createElement('div');
      this.slider.classList.add('image-slider');

      if (this.options.sliderClass != null && this.options.sliderClass !== undefined && this.options.sliderClass !== '' && this.options.sliderClass !== []) {
        if (typeof this.options.sliderClass == 'string') {
          this.slider.classList.add(this.options.sliderClass);
        } else if (Array.isArray(this.options.sliderClass)) {
          this.options.sliderClass.forEach(function (cl) {
            _this2.slider.classList.add(cl);
          });
        }
      }

      if (this.options.sliderContent != null && this.options.sliderContent !== undefined && this.options.sliderContent !== '') {
        this.slider.innerHTML = this.options.sliderContent;
      }

      this.element.append(this.slider);
      var slider_top = element_height / 2 - this._utilGetHeight(this.slider) / 2;
      var slider_left = element_width / 2 - this._utilGetWidth(this.slider) / 2;
      this.slider.style.top = "".concat(slider_top, "px");
      this.slider.style.left = "".concat(slider_left, "px"); // get and prepare the the images

      var images = this.element.querySelectorAll('img');
      images.forEach(function (element, index) {
        var img = document.createElement('div');
        img.classList.add('image-wrapper');
        img.style.width = "".concat(element_width, "px");
        img.style.height = "".concat(element_height, "px");
        img.style.backgroundImage = "url(".concat(element.src, ")");

        if (index === 0) {
          _this2.container.append(img);
        } else {
          _this2.containerOverlay.append(img);
        }
      });
    }
  }, {
    key: "_createEvents",

    /**
     * Create the component events.
     */
    value: function _createEvents() {
      this.slider.addEventListener('mousedown', this._startAll);
      this.slider.addEventListener('touchstart', this._startAll);
      window.addEventListener('resize', this._resize);
    }
    /**
     * Utility to get the cursor position relative to an Element.
     * @param {HTMLElement} el - The Element to get cursor position relative to this.
     * @param {object} e - Event.
     */

  }, {
    key: "_utilGetWidth",

    /**
     * Utility to get the width of an Element.
     * @param {HTMLElement} el - The Element to get the width.
     */
    value: function _utilGetWidth(el) {
      return parseFloat(getComputedStyle(el, null).width.replace("px", ""));
    }
    /**
     * Utility to get the height of an Element.
     * @param {HTMLElement} el - The Element to get the height.
     */

  }, {
    key: "_utilGetHeight",
    value: function _utilGetHeight(el) {
      return parseFloat(getComputedStyle(el, null).height.replace("px", ""));
    }
    /**
     * Utility to get the height ratio from a width.
     * @param {number} width - The width to get the aspect ratio.
     * @param {string} a - The aspect ratio ('16/9', '21/9', '4/3').
     */

  }, {
    key: "_utilAspectRatioH",
    value: function _utilAspectRatioH(width, a) {
      if (a === "16/9") {
        return width * 9 / 16;
      }

      if (a === "21/9") {
        return width * 9 / 21;
      }

      if (a === "4/3") {
        return width * 3 / 4;
      }

      return 0;
    }
    /**
     * Utility to generate a random integer.
     * @param {number} from - The opening interval to the random integer.
     * @param {number} to - The closing interval to the random integer.
     */

  }]);

  return ImageCompare;
}();