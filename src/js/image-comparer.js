class ImageCompare {
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
    constructor(elem, options = {}) {
        this.options = Object.assign({
            width: '100%',
            height: 'auto',
            sliderClass: '',
            sliderContent: '',
            onResize: null,
            onSliderMove: null,
        }, options);
        this.element = elem;
        this._setOptionsFromDOM();
        this._create();
    }

    /**
     * Set the options from DOM data-*
     */
    _setOptionsFromDOM() {
        const datasetKeys = Object.keys(this.element.dataset);
        for (let i = 0; i < datasetKeys.length; i += 1) {
            const key = datasetKeys[i];
            if (Object.prototype.hasOwnProperty.call(this.options, key)) {
                const value = this.element.dataset[key];
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
    _create() {
        this._createStructure();
        this._createEvents();
    }

    /**
     * Compute and apply the sizes to the component structure.
     */
    _applySize() {
        // set the element width
        if (this.options.width.toString().endsWith('%')
            || this.options.width.toString().endsWith('px')) {
            this.element.style.width = this.options.width;
        } else {
            this.element.style.width = `${this.options.width}px`;
        }
        // get parsed width
        const element_width = this._utilGetWidth(this.element);
        // compute and set the element height
        let element_height = parseInt(this.options.height);
        if (this.options.height === '16/9'
            || this.options.height === '21/9'
            || this.options.height === '4/3') {
            element_height = this._utilAspectRatioH(element_width, this.options.height);
        } else if (this.options.height === 'auto') {
            element_height = this._utilAspectRatioH(element_width, "16/9");
        }
        this.element.style.height = `${element_height}px`;
        return {
            element_width,
            element_height,
        };
    }

    /**
     * Compute and apply the sizes to the component structure
     * and to the child images and reposition the slider to center.
     */
    _applySizeComplete() {
        const { element_width, element_height } = this._applySize();
        // console.log(element_height);
        // resize the images
        const images = this.element.querySelectorAll('.image-wrapper');
        images.forEach(element => {
            element.style.width = `${element_width}px`;
            element.style.height = `${element_height}px`;
        });
        // resize the container overlay
        this.containerOverlay.style.width = `${element_width / 2}px`;
        // reposition the slider
        const slider_top = element_height / 2 - this._utilGetHeight(this.slider) / 2;
        const slider_left = element_width / 2 - this._utilGetWidth(this.slider) / 2;
        this.slider.style.top = `${slider_top}px`;
        this.slider.style.left = `${slider_left}px`;
        return {
            element_width,
            element_height,
        };
    }

    /**
     * Create the Component Structure.
     */
    _createStructure() {
        let id = this.element.getAttribute('id');
        if (id == null || id === undefined || id === "") {
            id = this._utilGenerateId('image-compare');
            this.element.setAttribute("id", id);
        }
        // add image-compare to element classList
        this.element.classList.add("image-compare");
        const { element_width, element_height } = this._applySize();
        // create the container and overlay and append to element
        this.container = document.createElement('div');
        this.container.classList.add('image-container');
        this.element.append(this.container);
        this.containerOverlay = document.createElement('div');
        this.containerOverlay.classList.add('image-container-overlay');
        this.containerOverlay.style.width = `${element_width / 2}px`;
        this.element.append(this.containerOverlay);
        // create the slider and append to element
        this.slider = document.createElement('div');
        this.slider.classList.add('image-slider');
        if (this.options.sliderClass != null 
            && this.options.sliderClass !== undefined
            && this.options.sliderClass !== ''
            && this.options.sliderClass !== []) {
            if (typeof(this.options.sliderClass) == 'string') {
                this.slider.classList.add(this.options.sliderClass);
            } else if(Array.isArray(this.options.sliderClass)) {
                this.options.sliderClass.forEach(cl => {
                    this.slider.classList.add(cl);
                });
            }
        }
        if (this.options.sliderContent != null 
            && this.options.sliderContent !== undefined
            && this.options.sliderContent !== '') {
            this.slider.innerHTML = this.options.sliderContent;
        }
        this.element.append(this.slider);
        const slider_top = element_height / 2 - this._utilGetHeight(this.slider) / 2;
        const slider_left = element_width / 2 - this._utilGetWidth(this.slider) / 2;
        this.slider.style.top = `${slider_top}px`;
        this.slider.style.left = `${slider_left}px`;
        // get and prepare the the images
        const images = this.element.querySelectorAll('img');
        images.forEach((element, index) => {
            const img = document.createElement('div');
            img.classList.add('image-wrapper');
            img.style.width = `${element_width}px`;
            img.style.height = `${element_height}px`;
            img.style.backgroundImage = `url(${element.src})`;
            if(index === 0) {
                this.container.append(img);
            } else {
                this.containerOverlay.append(img);
            }
        });
    }

    _moveAll = (e) => {
        const w = this._utilGetWidth(this.element);
        let x = this._utilGetCursorPosition(this.element, e).x;
        if (x < 0) {
            x = 0;
        }
        if (x > w) {
            x = w;
        }
        this.containerOverlay.style.width = `${x}px`;
        const left_pos = x - this._utilGetWidth(this.slider) / 2;
        this.slider.style.left = `${left_pos}px`;
        if (this.options.onSliderMove != null 
            && this.options.onSliderMove !== undefined) {
            this.options.onSliderMove(x, left_pos, this.slider)
        }
    }

    _stopAll = (e) => {
        document.removeEventListener('mousemove', this._moveAll);
        document.removeEventListener('touchmove', this._moveAll);
    }

    _startAll = (e) => {
        document.addEventListener('mousemove', this._moveAll);
        document.addEventListener('touchmove', this._moveAll);
        document.addEventListener('mouseup', this._stopAll);
        document.addEventListener('touchend', this._stopAll);
    }

    _resize = () => {
        const { element_width, element_height } = this._applySizeComplete();
        if (this.options.onResize != null 
            && this.options.onResize !== undefined) {
            this.options.onResize(element_width, element_height, this.element)
        }
    }

    /**
     * Create the component events.
     */
    _createEvents() {
        this.slider.addEventListener('mousedown', this._startAll);
        this.slider.addEventListener('touchstart', this._startAll);
        window.addEventListener('resize', this._resize);
    }

    /**
     * Utility to get the cursor position relative to an Element.
     * @param {HTMLElement} el - The Element to get cursor position relative to this.
     * @param {object} e - Event.
     */
    _utilGetCursorPosition = (el, e) => {
        const a = el.getBoundingClientRect();
        const px = e.changedTouches ? e.changedTouches[0].pageX : e.pageX;
        const py = e.changedTouches ? e.changedTouches[0].pageY : e.pageY;
        return {
            x: px - a.left - window.pageXOffset,
            y: py - a.top - window.pageYOffset
        };
    }

    /**
     * Utility to get the width of an Element.
     * @param {HTMLElement} el - The Element to get the width.
     */
    _utilGetWidth(el) {
        return parseFloat(getComputedStyle(el, null).width.replace("px", ""));
    }

    /**
     * Utility to get the height of an Element.
     * @param {HTMLElement} el - The Element to get the height.
     */
    _utilGetHeight(el) {
        return parseFloat(getComputedStyle(el, null).height.replace("px", ""));
    }

    /**
     * Utility to get the height ratio from a width.
     * @param {number} width - The width to get the aspect ratio.
     * @param {string} a - The aspect ratio ('16/9', '21/9', '4/3').
     */
    _utilAspectRatioH(width, a) {
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
    _utilRandomInt = (from, to) => Math.floor(Math.random() * (to - from + 1) + from);

    /**
     * Utility to generate a random id with a prefix.
     * @param {string} prefix - The prefix to the new id.
     */
    _utilGenerateId = (prefix) => {
        const time = (new Date()).getTime();
        const rand = this._utilRandomInt(1, 1000);
        return `${prefix}-${time}${rand}`;
    }
}