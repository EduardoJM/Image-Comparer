/**
 * Image Comparer - A little plugin that implements a image comparer.
 * @version v1.0.1
 * @author Eduardo Oliveira (EduardoJM) <eduardo_y05@outlook.com>.
 * @link https://github.com/EduardoJM/Image-Comparer
 * 
 * Licensed under the MIT License (https://github.com/EduardoJM/Image-Comparer/blob/master/LICENSE).
 */

"use strict";

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
    this.events = {
      RESIZE: new Event('resize'),
      SLIDERMOVE: new Event('slidermove')
    };
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
      // set the element width
      if (this.options.width.toString().endsWith('%') || this.options.width.toString().endsWith('px')) {
        this.element.style.width = this.options.width;
      } else {
        this.element.style.width = "".concat(this.options.width, "px");
      } // get parsed width


      var elementWidth = ImageCompare.utilGetWidth(this.element); // compute and set the element height

      var elementHeight = parseInt(this.options.height, 10);

      if (this.options.height === '16/9' || this.options.height === '21/9' || this.options.height === '4/3') {
        elementHeight = ImageCompare.utilAspectRatioH(elementWidth, this.options.height);
      } else if (this.options.height === 'auto') {
        elementHeight = ImageCompare.utilAspectRatioH(elementWidth, '16/9');
      }

      this.element.style.height = "".concat(elementHeight, "px");
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
      var _this$applySize = this.applySize(),
          elementWidth = _this$applySize.elementWidth,
          elementHeight = _this$applySize.elementHeight; // console.log(element_height);
      // resize the images


      var images = this.element.querySelectorAll('.image-wrapper');
      images.forEach(function (image) {
        var element = image;
        element.style.width = "".concat(elementWidth, "px");
        element.style.height = "".concat(elementHeight, "px");
      }); // resize the container overlay

      this.containerOverlay.style.width = "".concat(elementWidth / 2, "px"); // reposition the slider

      var sliderTop = elementHeight / 2 - ImageCompare.utilGetHeight(this.slider) / 2;
      var sliderLeft = elementWidth / 2 - ImageCompare.utilGetWidth(this.slider) / 2;
      this.slider.style.top = "".concat(sliderTop, "px");
      this.slider.style.left = "".concat(sliderLeft, "px");
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

      var id = this.element.getAttribute('id');

      if (id == null || id === undefined || id === '') {
        id = ImageCompare.utilGenerateId('image-compare');
        this.element.setAttribute('id', id);
      } // add image-compare to element classList


      this.element.classList.add('image-compare');

      var _this$applySize2 = this.applySize(),
          elementWidth = _this$applySize2.elementWidth,
          elementHeight = _this$applySize2.elementHeight; // create the container and overlay and append to element


      this.container = document.createElement('div');
      this.container.classList.add('image-container');
      this.element.append(this.container);
      this.containerOverlay = document.createElement('div');
      this.containerOverlay.classList.add('image-container-overlay');
      this.containerOverlay.style.width = "".concat(elementWidth / 2, "px");
      this.element.append(this.containerOverlay); // create the slider and append to element

      this.slider = document.createElement('div');
      this.slider.classList.add('image-slider');

      if (this.options.sliderClass != null && this.options.sliderClass !== undefined && this.options.sliderClass !== '' && this.options.sliderClass !== []) {
        if (typeof this.options.sliderClass === 'string') {
          var arr = this.options.sliderClass.split(' ');
          arr.forEach(function (cl) {
            _this.slider.classList.add(cl);
          });
        } else if (Array.isArray(this.options.sliderClass)) {
          this.options.sliderClass.forEach(function (cl) {
            _this.slider.classList.add(cl);
          });
        }
      }

      if (this.options.sliderContent != null && this.options.sliderContent !== undefined && this.options.sliderContent !== '') {
        this.slider.innerHTML = this.options.sliderContent;
      }

      this.element.append(this.slider);
      var sliderTop = elementHeight / 2 - ImageCompare.utilGetHeight(this.slider) / 2;
      var sliderLeft = elementWidth / 2 - ImageCompare.utilGetWidth(this.slider) / 2;
      this.slider.style.top = "".concat(sliderTop, "px");
      this.slider.style.left = "".concat(sliderLeft, "px"); // get and prepare the the images

      var images = this.element.querySelectorAll('img');
      images.forEach(function (element, index) {
        var img = document.createElement('div');
        img.classList.add('image-wrapper');
        img.style.width = "".concat(elementWidth, "px");
        img.style.height = "".concat(elementHeight, "px");
        img.style.backgroundImage = "url(".concat(element.src, ")");

        if (index === 0) {
          _this.container.append(img);
        } else {
          _this.containerOverlay.append(img);
        }
      });
    }
  }, {
    key: "eventMoveAll",
    value: function eventMoveAll(e) {
      var w = ImageCompare.utilGetWidth(this.element);

      var _ImageCompare$utilGet = ImageCompare.utilGetCursorPosition(this.element, e),
          x = _ImageCompare$utilGet.x;

      if (x < 0) {
        x = 0;
      }

      if (x > w) {
        x = w;
      }

      this.containerOverlay.style.width = "".concat(x, "px");
      var leftPos = x - ImageCompare.utilGetWidth(this.slider) / 2;
      this.slider.style.left = "".concat(leftPos, "px");

      if (this.options.onSliderMove != null && this.options.onSliderMove !== undefined) {
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

      if (this.options.onResize != null && this.options.onResize !== undefined) {
        this.options.onResize(elementWidth, elementHeight, this.element);
      }

      this.element.dispatchEvent(this.events.RESIZE);
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
    /**
     * Utility to get the cursor position relative to an Element.
     * @param {HTMLElement} el - The Element to get cursor position relative to this.
     * @param {object} e - Event.
     */

  }], [{
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
    /**
     * Utility to get the width of an Element.
     * @param {HTMLElement} el - The Element to get the width.
     */

  }, {
    key: "utilGetWidth",
    value: function utilGetWidth(el) {
      return parseFloat(getComputedStyle(el, null).width.replace('px', ''));
    }
    /**
     * Utility to get the height of an Element.
     * @param {HTMLElement} el - The Element to get the height.
     */

  }, {
    key: "utilGetHeight",
    value: function utilGetHeight(el) {
      return parseFloat(getComputedStyle(el, null).height.replace('px', ''));
    }
    /**
     * Utility to get the height ratio from a width.
     * @param {number} width - The width to get the aspect ratio.
     * @param {string} a - The aspect ratio ('16/9', '21/9', '4/3').
     */

  }, {
    key: "utilAspectRatioH",
    value: function utilAspectRatioH(width, a) {
      if (a === '16/9') {
        return width * 9 / 16;
      }

      if (a === '21/9') {
        return width * 9 / 21;
      }

      if (a === '4/3') {
        return width * 3 / 4;
      }

      return 0;
    }
    /**
     * Utility to generate a random integer.
     * @param {number} from - The opening interval to the random integer.
     * @param {number} to - The closing interval to the random integer.
     */

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