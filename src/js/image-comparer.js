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
        const isDeviceMobile = 'ontouchstart' in document.documentElement;
        const [ up, down, move ] = (isDeviceMobile ? ['touchend', 'touchstart', 'touchmove'] : ['mouseup', 'mousedown', 'mousemove']);
        this.deviceEvents = { up, down, move };
        this.options = Object.assign({}, ImageCompareDefaultOptions, options);
        this.element = elem;
        this.setOptionsFromDOM();
        this.eventMoveAll = this.eventMoveAll.bind(this);
        this.eventResize = this.eventResize.bind(this);
        this.eventStartAll = this.eventStartAll.bind(this);
        this.aspectRatios = {
            '4/3': 4/3,
            '16/9': 16/9,
            '21/9': 21/9,
            'auto': 16/9,
        };
        //this.defaultAspectRatio = '16/9';
        this.events = {
            RESIZE: new Event('resize'),
            SLIDERMOVE: new Event('slidermove'),
        };
        const { elementWidth, elementHeight } = this.applySize();
        this.elementWidth = elementWidth;
        this.elementHeight = elementHeight;
        this.create();
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
        const { width, height } = this.options;
        const measureRule = /\d+(px|%|em|rem)/;
        this.element.style.width = measureRule.test(String(width)) ? width : `${width}px`;
        const elementWidth = ImageCompare.utilGetWidth(this.element);
        let elementHeight = 0;
        if (height in this.aspectRatios) {
            elementHeight = 1 / (this.aspectRatios[height] / elementWidth);
            this.element.style.height = `${elementHeight}px`;
        } else {
            this.element.style.height = measureRule.test(String(height)) ? height : `${height}px`;
            elementHeight = ImageCompare.utilGetHeight(this.element);
        }
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
        const { elementWidth, elementHeight } = this;
        // resize the images
        const images = this.element.querySelectorAll('.image-wrapper');
        images.forEach((image) => {
            ImageCompare.insertElementStyle(image, {
                width: `${elementWidth}px`,
                height: `${elementHeight}px`
            });
        });
        // resize the container overlay
        ImageCompare.insertElementStyle(this.containerOverlay, { width: `${elementWidth / 2}px`});
        // reposition the slider
        this.adjustSlider();
        return {
            elementWidth,
            elementHeight,
        };
    }

    /**
     * Create the Component Structure.
     */
    createStructure() {
        const id = this.element.getAttribute('id') || ImageCompare.utilGenerateId('image-compare');
        const { elementWidth, elementHeight } = this;
        this.element.setAttribute('id', id);
        // add image-compare to element classList
        this.element.classList.add('image-compare');
        
        this.container = ImageCompare.createElement({
            classList: 'image-container',
            container: this.element
        });
        this.containerOverlay = ImageCompare.createElement({
            classList: 'image-container-overlay',
            style: {width: `${elementWidth / 2}px`},
            container: this.element
        });
        this.slider = ImageCompare.createElement({
            classList: 'image-slider',
            beforeAppend: (el) => {
                const { sliderClass } = this.options;
                // check if is not undefined, null, '' or []
                if (!(!sliderClass || Number(sliderClass) === 0)) {
                    const arr = (typeof sliderClass === 'string') ? sliderClass.split(' ') : sliderClass;
                    arr.forEach((cl) => {
                        el.classList.add(cl);
                    });
                }
                if (this.options.sliderContent) {
                    el.innerHTML = this.options.sliderContent;
                }
            },
            container: this.element
        });
        this.adjustSlider();
        // get and prepare the the images
        const images = this.element.querySelectorAll('img');
        images.forEach((element, index) => {
            const container = (index === 0) ? this.container : this.containerOverlay;
            ImageCompare.createElement({
                classList: 'image-wrapper',
                style: {
                    width: `${elementWidth}px`,
                    height: `${elementHeight}px`,
                    backgroundImage: `url(${element.src})`
                },
                container
            });
        });
    }

    eventMoveAll(e) {
        const w = ImageCompare.utilGetWidth(this.element);
        let { x } = ImageCompare.utilGetCursorPosition(this.element, e);
        x = Math.max(0, Math.min(x, w));
        this.containerOverlay.style.width = `${x}px`;
        const leftPos = x - ImageCompare.utilGetWidth(this.slider) / 2;
        this.slider.style.left = `${leftPos}px`;
        if (this.options.onSliderMove) {
            this.options.onSliderMove(x, leftPos, this.slider);
        }
        this.element.dispatchEvent(this.events.SLIDERMOVE);
    }

    shouldMoveAll(shouldMove){
        const method = shouldMove ? 'addEventListener' : 'removeEventListener';
        document[method](this.deviceEvents.move, this.eventMoveAll);
    }

    eventStartAll() {
        this.shouldMoveAll(true);
        document.addEventListener(this.deviceEvents.up, () => { this.shouldMoveAll(false) });
    }

    eventResize() {
        const { elementWidth, elementHeight } = this.applySizeComplete();
        this.element.dispatchEvent(this.events.RESIZE);
        if (!(this.options.onResize)) return;
        this.options.onResize(elementWidth, elementHeight, this.element);
    }

    /**
     * Create the component events.
     */
    createEvents() {
        this.slider.addEventListener(this.deviceEvents.down, this.eventStartAll);
        window.addEventListener('resize', this.eventResize);
    }

    adjustSlider(){
        const sliderTop = this.elementHeight / 2 - ImageCompare.utilGetHeight(this.slider) / 2;
        const sliderLeft = this.elementWidth / 2 - ImageCompare.utilGetWidth(this.slider) / 2;
        ImageCompare.insertElementStyle(this.slider, {
            top: `${sliderTop}px`,
            left: `${sliderLeft}px`
        });
    }

    /**
     * Utility to insert style into an Element
     * @param {HTMLElement} el - The Element that will receive style.
     * @param {object} style - style object.
     */
    static insertElementStyle(element, style){
        Object.assign(element.style, style);
    }

    static createElement({ classList='', style={}, container, beforeAppend = ()=>{}}) {
        const el = document.createElement('div');
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
    static utilGetCursorPosition(el, e) {
        const a = el.getBoundingClientRect();
        const px = e.changedTouches ? e.changedTouches[0].pageX : e.pageX;
        const py = e.changedTouches ? e.changedTouches[0].pageY : e.pageY;
        return {
            x: px - a.left - window.pageXOffset,
            y: py - a.top - window.pageYOffset,
        };
    }

    static utilGetDimension(strArray) {
        if(strArray.length === 1){
            return String(parseFloat(...strArray));
        }
        return strArray.map(str => String(parseFloat(str)));
    }

    /**
     * Utility to get the width of an Element.
     * @param {HTMLElement} el - The Element to get the width.
     */
    static utilGetWidth(el) {
        return ImageCompare.utilGetDimension([getComputedStyle(el, null).width]);
    }

    /**
     * Utility to get the height of an Element.
     * @param {HTMLElement} el - The Element to get the height.
     */
    static utilGetHeight(el) {
        return ImageCompare.utilGetDimension([getComputedStyle(el, null).height]);
    }

    /**
     * Utility to get the height ratio from a width.
     * @param {number} width - The width to get the aspect ratio.
     * @param {string} a - The aspect ratio ('16/9', '21/9', '4/3').
     */
    utilAspectRatioH(width, a) {
        return (width / this.aspectRatios[a]) || this.aspectRatios['0'];
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
