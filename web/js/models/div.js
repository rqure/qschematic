
class Div extends DrawableShape {
    constructor() {
        super();
        this._html = '';
        this._className = '';
        this._width = 0;
        this._height = 0;
        this.onclick = null;
    }

    get html() {
        return this._html;
    }

    get className() {
        return this._className;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
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

    drawImplementation() {
        const icon = L.divIcon({
            className: this._className,
            html: this._html,
            iconSize: [this._width, this._height],
        });

        const marker = L.marker([this.location.y, this.location.x], {
            icon: icon,
            interactive: true
        });

        if (this.onclick && typeof this.onclick === 'function') {
            marker.on("click", this.onclick.bind(this));
        }

        return marker;
    }
}