
class Div extends DrawableShape {
    constructor() {
        super();
        this._html = '';
        this._className = '';
        this._width = 0;
        this._height = 0;
        this._scaleWithZoom = false;
        this._zoom = 1;
        this._marker = null;
        this.onclick = null;

        this.ondestroy.add(() => this._marker = null);
    }

    get html() {
        return this._html;
    }

    get className() {
        return this._className;
    }

    get width() {
        return this._width * this.zoomScaleFactor;
    }

    get height() {
        return this._height * this.zoomScaleFactor;
    }

    get scaleWithZoom() {
        return this._scaleWithZoom;
    }

    get zoomScaleFactor() {
        if (!this.scaleWithZoom) {
            return 1;
        }

        return Math.pow(2, this.zoom - this.minZoom);
    }

    get zoom() {
        return this._zoom;
    }

    setClassName(value) {
        this._className = value;
        return this;
    }

    setHtml(value) {
        this._html = value;
        return this;
    }

    setWidth(value) {
        this._width = value;
        return this;
    }

    setHeight(value) {
        this._height = value;
        return this;
    }

    setZoom(value) {
        this._zoom = value;
        return this;
    }

    setScaleWithZoom(value) {
        this._scaleWithZoom = value;
        return this;
    }

    applySmoothScaling() {
        const element = this._marker.getElement();  // Get the HTML element for the marker (note its null for some reason...)

        if (element) {
            element.style.transition = 'transform 0.3s ease-in-out';  // Smooth transition
            const scaleFactor = this.zoomScaleFactor;
            element.style.transform = `scale(${scaleFactor})`;  // Apply smooth scaling

            // Also scale the inner text by finding the text container
            const textElement = element.querySelector('.text-to-scale');  // Assuming class for text
            if (textElement) {
                textElement.style.transform = `scale(${scaleFactor})`;
                textElement.style.transition = 'transform 0.3s ease-in-out';  // Smooth scaling for text
            }
        }
    }

    drawImplementation() {
        const icon = L.divIcon({
            className: this._className,
            html: this._html,
            iconSize: [this.width, this.height],
        });

        if (!this._marker) {
            this._marker = L.marker([this.location.y, this.location.x], {
                icon: icon,
                interactive: true
            });

            if (this.onclick && typeof this.onclick === 'function') {
                this._marker.on("click", this.onclick.bind(this));
            }
        } else {
            this._marker.setIcon(icon);

            if (this._scaleWithZoom) {
                this.applySmoothScaling();
            }
        }

        return this._marker;
    }
}