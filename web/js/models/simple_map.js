class SimpleMap {
    constructor(id) {
        this._map = L.map(id, {
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

    moveTo(point, zoom=0) {
        this._map.setView([point.y, point.x], zoom);
    }

    draw(drawable) {
        drawable.draw(this._map);
    }

    setBoundary(from, to) {
        this._bottomLeft = from;
        this._topRight = to;

        const boundary = [
            [from.y, from.x],
            [to.y, to.x]
        ];

        this._map.fitBounds(boundary);
        this._map.setMaxBounds(boundary);

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