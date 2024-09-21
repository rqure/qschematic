class ImageOverlay extends DrawableShape {
    constructor(url, width=0, height=0) {
        super();
        this._url = url;
        this._width = width;
        this._height = height;
    }

    get width() { return this._width; }
    get height() { return this._height; }
    get url() { return this._url; }

    setUrl(value) { this._url = value; return this; }
    setWidth(value) { this._width = value; return this; }
    setHeight(value) { this._height = value; return this; }

    drawImplementation() {
        const config = {
            interactive: true
        };

        if (this._pane) {
            config.pane = this._pane.name;
        }

        const overlay = L.imageOverlay(this._url, [
            [this.location.y, this.location.x, this.location.z],
            [this.height + this.location.y, this.width + this.location.x, this.location.z]
        ], config);

        overlay.on("click", this.onClick.bind(this));

        return overlay;
    }

    onClick() {
        
    }
};