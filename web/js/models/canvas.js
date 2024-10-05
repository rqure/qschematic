class Canvas {
    constructor(id) {
        this._implementation = L.map(id, {
            crs: L.CRS.Simple,
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: false, // disable original zoom function
            smoothWheelZoom: true,  // enable smooth zoom 
            smoothSensitivity: 1.5,   // zoom speed. default is 1
        });
        this._bottomLeft = new Point();
        this._topRight = new Point();
    }

    get implementation() { return this._implementation; }

    moveTo(point, zoom=0) {
        this._implementation.setView([point.y, point.x], zoom);
    }

    draw(drawable) {
        drawable.draw(this);
    }

    setBoundary(from, to) {
        this._bottomLeft = from;
        this._topRight = to;

        const boundary = [
            [from.y, from.x],
            [to.y, to.x]
        ];

        this._implementation.fitBounds(boundary);
        this._implementation.setMaxBounds(boundary);

        return this;
    }

    get boundaryHeight() { return Math.abs(this._bottomLeft.y - this._topRight.y); }
    get boundaryWidth() { return Math.abs(this._bottomLeft.x - this._topRight.x); }

    get center() {
        let x = (this._bottomLeft.x + this._topRight.x) / 2;
        let y = (this._bottomLeft.y + this._topRight.y) / 2;
        return new Point(x, y);
    }
};