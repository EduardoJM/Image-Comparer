/**
 * Image Comparer - A little plugin that implements a image comparer.
 * @version v1.0.1
 * @author Eduardo Oliveira (EduardoJM) <eduardo_y05@outlook.com>.
 * @link https://github.com/EduardoJM/Image-Comparer
 * 
 * Licensed under the MIT License (https://github.com/EduardoJM/Image-Comparer/blob/master/LICENSE).
 */

"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ImageCompareDefaultOptions = {
  width: '100%',
  height: 'auto',
  sliderClass: '',
  sliderContent: '',
  onResize: null,
  onSliderMove: null
};

var ImageCompare = /*#__PURE__*/function () {
  // eslint-disable-line no-unused-vars

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
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, ImageCompare);

    var isDeviceMobile = ('ontouchstart' in document.documentElement);

    var _ref = isDeviceMobile ? ['touchend', 'touchstart', 'touchmove'] : ['mouseup', 'mousedown', 'mousemove'],
        _ref2 = _slicedToArray(_ref, 3),
        up = _ref2[0],
        down = _ref2[1],
        move = _ref2[2];

    this.deviceEvents = {
      up: up,
      down: down,
      move: move
    };
    this.options = Object.assign({}, ImageCompareDefaultOptions, options);
    this.element = elem;
    this.setOptionsFromDOM();
    this.eventMoveAll = this.eventMoveAll.bind(this);
    this.eventResize = this.eventResize.bind(this);
    this.eventStartAll = this.eventStartAll.bind(this);
    this.aspectRatios = {
      '0': 0,
      '4/3': 4 / 3,
      '16/9': 16 / 9,
      '21/9': 21 / 9
    };
    this.defaultAspectRatio = '16/9';
    this.events = {
      RESIZE: new Event('resize'),
      SLIDERMOVE: new Event('slidermove')
    };

    var _this$applySize = this.applySize(),
        elementWidth = _this$applySize.elementWidth,
        elementHeight = _this$applySize.elementHeight;

    this.elementWidth = elementWidth;
    this.elementHeight = elementHeight;
    this.create();
  }
  /**
   * Set the options from DOM data-*
   */


  _createClass(ImageCompare, [{
    key: "setOptionsFromDOM",
    value: function setOptionsFromDOM() {
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
    key: "create",
    value: function create() {
      this.createStructure();
      this.createEvents();
    }
    /**
     * Compute and apply the sizes to the component structure.
     */

  }, {
    key: "applySize",
    value: function applySize() {
      var _this$options = this.options,
          width = _this$options.width,
          height = _this$options.height;
      var measureRule = /\d+(px|%)/; // get parsed width and height

      var _ImageCompare$utilGet = ImageCompare.utilGetDimension([width, height]),
          _ImageCompare$utilGet2 = _slicedToArray(_ImageCompare$utilGet, 2),
          elementWidth = _ImageCompare$utilGet2[0],
          elementHeight = _ImageCompare$utilGet2[1]; // compute and set the element height


      var aspectRatio = height in this.aspectRatios ? height : this.defaultAspectRatio;
      elementHeight = this.utilAspectRatioH(elementWidth, aspectRatio); // set the element width and height

      ImageCompare.insertElementStyle(this.element, {
        width: measureRule.test(String(width)) ? width : "".concat(width, "px"),
        height: "".concat(elementHeight, "px")
      });
      return {
        elementWidth: elementWidth,
        elementHeight: elementHeight
      };
    }
    /**
     * Compute and apply the sizes to the component structure
     * and to the child images and reposition the slider to center.
     */

  }, {
    key: "applySizeComplete",
    value: function applySizeComplete() {
      var elementWidth = this.elementWidth,
          elementHeight = this.elementHeight; // resize the images

      var images = this.element.querySelectorAll('.image-wrapper');
      images.forEach(function (image) {
        ImageCompare.insertElementStyle(image, {
          width: "".concat(elementWidth, "px"),
          height: "".concat(elementHeight, "px")
        });
      }); // resize the container overlay

      ImageCompare.insertElementStyle(this.containerOverlay, {
        width: "".concat(elementWidth / 2, "px")
      }); // reposition the slider

      this.adjustSlider();
      return {
        elementWidth: elementWidth,
        elementHeight: elementHeight
      };
    }
    /**
     * Create the Component Structure.
     */

  }, {
    key: "createStructure",
    value: function createStructure() {
      var _this = this;

      var id = this.element.getAttribute('id') || ImageCompare.utilGenerateId('image-compare');
      var elementWidth = this.elementWidth,
          elementHeight = this.elementHeight;
      this.element.setAttribute('id', id); // add image-compare to element classList

      this.element.classList.add('image-compare');
      this.container = ImageCompare.createElement({
        classList: 'image-container',
        container: this.element
      });
      this.containerOverlay = ImageCompare.createElement({
        classList: 'image-container-overlay',
        style: {
          width: "".concat(elementWidth / 2, "px")
        },
        container: this.element
      });
      this.slider = ImageCompare.createElement({
        classList: 'image-slider',
        beforeAppend: function beforeAppend(el) {
          var sliderClass = _this.options.sliderClass; // check if is not undefined, null, '' or []

          if (!(!sliderClass || Number(sliderClass) === 0)) {
            var arr = typeof sliderClass === 'string' ? sliderClass.split(' ') : sliderClass;
            arr.forEach(function (cl) {
              el.classList.add(cl);
            });
          }

          if (_this.options.sliderContent) {
            el.innerHTML = sliderClass.sliderContent;
          }
        },
        container: this.element
      });
      this.adjustSlider(); // get and prepare the the images

      var images = this.element.querySelectorAll('img');
      images.forEach(function (element, index) {
        var container = index === 0 ? _this.container : _this.containerOverlay;
        ImageCompare.createElement({
          classList: 'image-wrapper',
          style: {
            width: "".concat(elementWidth, "px"),
            height: "".concat(elementHeight, "px"),
            backgroundImage: "url(".concat(element.src, ")")
          },
          container: container
        });
      });
    }
  }, {
    key: "eventMoveAll",
    value: function eventMoveAll(e) {
      var w = ImageCompare.utilGetWidth(this.element);

      var _ImageCompare$utilGet3 = ImageCompare.utilGetCursorPosition(this.element, e),
          x = _ImageCompare$utilGet3.x;

      x = Math.max(0, Math.min(x, w));
      this.containerOverlay.style.width = "".concat(x, "px");
      var leftPos = x - ImageCompare.utilGetWidth(this.slider) / 2;
      this.slider.style.left = "".concat(leftPos, "px");

      if (this.options.onSliderMove) {
        this.options.onSliderMove(x, leftPos, this.slider);
      }

      this.element.dispatchEvent(this.events.SLIDERMOVE);
    }
  }, {
    key: "shouldMoveAll",
    value: function shouldMoveAll(shouldMove) {
      var method = shouldMove ? 'addEventListener' : 'removeEventListener';
      document[method](this.deviceEvents.move, this.eventMoveAll);
    }
  }, {
    key: "eventStartAll",
    value: function eventStartAll() {
      var _this2 = this;

      this.shouldMoveAll(true);
      document.addEventListener(this.deviceEvents.up, function () {
        _this2.shouldMoveAll(false);
      });
    }
  }, {
    key: "eventResize",
    value: function eventResize() {
      var _this$applySizeComple = this.applySizeComplete(),
          elementWidth = _this$applySizeComple.elementWidth,
          elementHeight = _this$applySizeComple.elementHeight;

      this.element.dispatchEvent(this.events.RESIZE);
      if (!this.options.onResize) return;
      this.options.onResize(elementWidth, elementHeight, this.element);
    }
    /**
     * Create the component events.
     */

  }, {
    key: "createEvents",
    value: function createEvents() {
      this.slider.addEventListener(this.deviceEvents.down, this.eventStartAll);
      window.addEventListener('resize', this.eventResize);
    }
  }, {
    key: "adjustSlider",
    value: function adjustSlider() {
      var sliderTop = this.elementHeight / 2 - ImageCompare.utilGetHeight(this.slider) / 2;
      var sliderLeft = this.elementWidth / 2 - ImageCompare.utilGetWidth(this.slider) / 2;
      ImageCompare.insertElementStyle(this.slider, {
        top: "".concat(sliderTop, "px"),
        left: "".concat(sliderLeft, "px")
      });
    }
    /**
     * Utility to insert style into an Element
     * @param {HTMLElement} el - The Element that will receive style.
     * @param {object} style - style object.
     */

  }, {
    key: "utilAspectRatioH",

    /**
     * Utility to get the height ratio from a width.
     * @param {number} width - The width to get the aspect ratio.
     * @param {string} a - The aspect ratio ('16/9', '21/9', '4/3').
     */
    value: function utilAspectRatioH(width, a) {
      return width / this.aspectRatios[a] || this.aspectRatios['0'];
    }
    /**
     * Utility to generate a random integer.
     * @param {number} from - The opening interval to the random integer.
     * @param {number} to - The closing interval to the random integer.
     */

  }], [{
    key: "insertElementStyle",
    value: function insertElementStyle(element, style) {
      Object.assign(element.style, style);
    }
  }, {
    key: "createElement",
    value: function createElement(_ref3) {
      var _ref3$classList = _ref3.classList,
          classList = _ref3$classList === void 0 ? '' : _ref3$classList,
          _ref3$style = _ref3.style,
          style = _ref3$style === void 0 ? {} : _ref3$style,
          container = _ref3.container,
          _ref3$beforeAppend = _ref3.beforeAppend,
          beforeAppend = _ref3$beforeAppend === void 0 ? function () {} : _ref3$beforeAppend;
      var el = document.createElement('div');
      el.classList.add(classList);
      ImageCompare.insertElementStyle(el, style);
      beforeAppend(el);
      container.append(el);
      return el;
    }
    /**
     * Utility to get the cursor position relative to an Element.
     * @param {HTMLElement} el - The Element to get cursor position relative to this.
     * @param {object} e - Event.
     */

  }, {
    key: "utilGetCursorPosition",
    value: function utilGetCursorPosition(el, e) {
      var a = el.getBoundingClientRect();
      var px = e.changedTouches ? e.changedTouches[0].pageX : e.pageX;
      var py = e.changedTouches ? e.changedTouches[0].pageY : e.pageY;
      return {
        x: px - a.left - window.pageXOffset,
        y: py - a.top - window.pageYOffset
      };
    }
  }, {
    key: "utilGetDimension",
    value: function utilGetDimension(strArray) {
      if (strArray.length === 1) {
        return String(parseFloat.apply(void 0, _toConsumableArray(strArray)));
      }

      return strArray.map(function (str) {
        return String(parseFloat(str));
      });
    }
    /**
     * Utility to get the width of an Element.
     * @param {HTMLElement} el - The Element to get the width.
     */

  }, {
    key: "utilGetWidth",
    value: function utilGetWidth(el) {
      return ImageCompare.utilGetDimension([getComputedStyle(el, null).width]);
    }
    /**
     * Utility to get the height of an Element.
     * @param {HTMLElement} el - The Element to get the height.
     */

  }, {
    key: "utilGetHeight",
    value: function utilGetHeight(el) {
      return ImageCompare.utilGetDimension([getComputedStyle(el, null).height]);
    }
  }, {
    key: "utilRandomInt",
    value: function utilRandomInt(from, to) {
      return Math.floor(Math.random() * (to - from + 1) + from);
    }
    /**
     * Utility to generate a random id with a prefix.
     * @param {string} prefix - The prefix to the new id.
     */

  }, {
    key: "utilGenerateId",
    value: function utilGenerateId(prefix) {
      var time = new Date().getTime();
      var rand = ImageCompare.utilRandomInt(1, 1000);
      return "".concat(prefix, "-").concat(time).concat(rand);
    }
  }]);

  return ImageCompare;
}();