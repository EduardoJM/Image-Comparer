const ImageCompareDefaultOptions = {
    width: '100%',
    height: 'auto',
    sliderClass: '',
    sliderContent: '',
    onResize: null,
    onSliderMove: null,
};

class ImageCompare { // eslint-disable-line no-unused-vars
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
        this.options = Object.assign(ImageCompareDefaultOptions, options);
        this.element = elem;
        this.setOptionsFromDOM();
        this.eventMoveAll = this.eventMoveAll.bind(this);
        this.eventResize = this.eventResize.bind(this);
        this.eventStartAll = this.eventStartAll.bind(this);
        this.eventStopAll = this.eventStopAll.bind(this);
        this.create();
        this.events = {
            RESIZE: new Event('resize'),
            SLIDERMOVE: new Event('slidermove'),
        };
    }

    /**
     * Set the options from DOM data-*
     */
    setOptionsFromDOM() {
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
    create() {
        this.createStructure();
        this.createEvents();
    }

    /**
     * Compute and apply the sizes to the component structure.
     */
    applySize() {
        // set the element width
        if (this.options.width.toString().endsWith('%')
            || this.options.width.toString().endsWith('px')) {
            this.element.style.width = this.options.width;
        } else {
            this.element.style.width = `${this.options.width}px`;
        }
        // get parsed width
        const elementWidth = ImageCompare.utilGetWidth(this.element);
        // compute and set the element height
        let elementHeight = parseInt(this.options.height, 10);
        if (this.options.height === '16/9'
            || this.options.height === '21/9'
            || this.options.height === '4/3') {
            elementHeight = ImageCompare.utilAspectRatioH(elementWidth, this.options.height);
        } else if (this.options.height === 'auto') {
            elementHeight = ImageCompare.utilAspectRatioH(elementWidth, '16/9');
        }
        this.element.style.height = `${elementHeight}px`;
        return {
            elementWidth,
            elementHeight,
        };
    }

    /**
     * Compute and apply the sizes to the component structure
     * and to the child images and reposition the slider to center.
     */
    applySizeComplete() {
        const { elementWidth, elementHeight } = this.applySize();
        // console.log(element_height);
        // resize the images
        const images = this.element.querySelectorAll('.image-wrapper');
        images.forEach((image) => {
            const element = image;
            element.style.width = `${elementWidth}px`;
            element.style.height = `${elementHeight}px`;
        });
        // resize the container overlay
        this.containerOverlay.style.width = `${elementWidth / 2}px`;
        // reposition the slider
        const sliderTop = elementHeight / 2 - ImageCompare.utilGetHeight(this.slider) / 2;
        const sliderLeft = elementWidth / 2 - ImageCompare.utilGetWidth(this.slider) / 2;
        this.slider.style.top = `${sliderTop}px`;
        this.slider.style.left = `${sliderLeft}px`;
        return {
            elementWidth,
            elementHeight,
        };
    }

    /**
     * Create the Component Structure.
     */
    createStructure() {
        let id = this.element.getAttribute('id');
        if (id == null || id === undefined || id === '') {
            id = ImageCompare.utilGenerateId('image-compare');
            this.element.setAttribute('id', id);
        }
        // add image-compare to element classList
        this.element.classList.add('image-compare');
        const { elementWidth, elementHeight } = this.applySize();
        // create the container and overlay and append to element
        this.container = document.createElement('div');
        this.container.classList.add('image-container');
        this.element.append(this.container);
        this.containerOverlay = document.createElement('div');
        this.containerOverlay.classList.add('image-container-overlay');
        this.containerOverlay.style.width = `${elementWidth / 2}px`;
        this.element.append(this.containerOverlay);
        // create the slider and append to element
        this.slider = document.createElement('div');
        this.slider.classList.add('image-slider');
        if (this.options.sliderClass != null
            && this.options.sliderClass !== undefined
            && this.options.sliderClass !== ''
            && this.options.sliderClass !== []) {
            if (typeof this.options.sliderClass === 'string') {
                const arr = this.options.sliderClass.split(' ');
                arr.forEach((cl) => {
                    this.slider.classList.add(cl);
                });
            } else if (Array.isArray(this.options.sliderClass)) {
                this.options.sliderClass.forEach((cl) => {
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
        const sliderTop = elementHeight / 2 - ImageCompare.utilGetHeight(this.slider) / 2;
        const sliderLeft = elementWidth / 2 - ImageCompare.utilGetWidth(this.slider) / 2;
        this.slider.style.top = `${sliderTop}px`;
        this.slider.style.left = `${sliderLeft}px`;
        // get and prepare the the images
        const images = this.element.querySelectorAll('img');
        images.forEach((element, index) => {
            const img = document.createElement('div');
            img.classList.add('image-wrapper');
            img.style.width = `${elementWidth}px`;
            img.style.height = `${elementHeight}px`;
            img.style.backgroundImage = `url(${element.src})`;
            if (index === 0) {
                this.container.append(img);
            } else {
                this.containerOverlay.append(img);
            }
        });
    }

    eventMoveAll(e) {
        const w = ImageCompare.utilGetWidth(this.element);
        let { x } = ImageCompare.utilGetCursorPosition(this.element, e);
        if (x < 0) {
            x = 0;
        }
        if (x > w) {
            x = w;
        }
        this.containerOverlay.style.width = `${x}px`;
        const leftPos = x - ImageCompare.utilGetWidth(this.slider) / 2;
        this.slider.style.left = `${leftPos}px`;
        if (this.options.onSliderMove != null
            && this.options.onSliderMove !== undefined) {
            this.options.onSliderMove(x, leftPos, this.slider);
        }
        this.element.dispatchEvent(this.events.SLIDERMOVE);
    }

    eventStopAll() {
        document.removeEventListener('mousemove', this.eventMoveAll);
        document.removeEventListener('touchmove', this.eventMoveAll);
    }

    eventStartAll() {
        document.addEventListener('mousemove', this.eventMoveAll);
        document.addEventListener('touchmove', this.eventMoveAll);
        document.addEventListener('mouseup', this.eventStopAll);
        document.addEventListener('touchend', this.eventStopAll);
    }

    eventResize() {
        const { elementWidth, elementHeight } = this.applySizeComplete();
        if (this.options.onResize != null
            && this.options.onResize !== undefined) {
            this.options.onResize(elementWidth, elementHeight, this.element);
        }
        this.element.dispatchEvent(this.events.RESIZE);
    }

    /**
     * Create the component events.
     */
    createEvents() {
        this.slider.addEventListener('mousedown', this.eventStartAll);
        this.slider.addEventListener('touchstart', this.eventStartAll);
        window.addEventListener('resize', this.eventResize);
    }

    /**
     * Utility to get the cursor position relative to an Element.
     * @param {HTMLElement} el - The Element to get cursor position relative to this.
     * @param {object} e - Event.
     */
    static utilGetCursorPosition(el, e) {
        const a = el.getBoundingClientRect();
        const px = e.changedTouches ? e.changedTouches[0].pageX : e.pageX;
        const py = e.changedTouches ? e.changedTouches[0].pageY : e.pageY;
        return {
            x: px - a.left - window.pageXOffset,
            y: py - a.top - window.pageYOffset,
        };
    }

    /**
     * Utility to get the width of an Element.
     * @param {HTMLElement} el - The Element to get the width.
     */
    static utilGetWidth(el) {
        return parseFloat(getComputedStyle(el, null).width.replace('px', ''));
    }

    /**
     * Utility to get the height of an Element.
     * @param {HTMLElement} el - The Element to get the height.
     */
    static utilGetHeight(el) {
        return parseFloat(getComputedStyle(el, null).height.replace('px', ''));
    }

    /**
     * Utility to get the height ratio from a width.
     * @param {number} width - The width to get the aspect ratio.
     * @param {string} a - The aspect ratio ('16/9', '21/9', '4/3').
     */
    static utilAspectRatioH(width, a) {
        if (a === '16/9') {
            return (width * 9) / 16;
        }
        if (a === '21/9') {
            return (width * 9) / 21;
        }
        if (a === '4/3') {
            return (width * 3) / 4;
        }
        return 0;
    }

    /**
     * Utility to generate a random integer.
     * @param {number} from - The opening interval to the random integer.
     * @param {number} to - The closing interval to the random integer.
     */
    static utilRandomInt(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    }

    /**
     * Utility to generate a random id with a prefix.
     * @param {string} prefix - The prefix to the new id.
     */
    static utilGenerateId(prefix) {
        const time = (new Date()).getTime();
        const rand = ImageCompare.utilRandomInt(1, 1000);
        return `${prefix}-${time}${rand}`;
    }
}
