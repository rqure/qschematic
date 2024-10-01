class Polyline extends DrawableShape {
    constructor() {
        super();
        this._points = [];
    }

    setOffset(value) {
        for (let i = 0; i < this._points.length; i++) {
            this._points[i][0] += value.y + this._offset.y;
            this._points[i][1] += value.x + this._offset.x;
        }

        super.setOffset(value);
    }

    addEdge(point) {
        this._points.push([point.y + this._offset.y, point.x + this._offset.x]);
        return this;
    }

    drawImplementation() {
        const config = {
            color: this._color,
            weight: this._weight,
            opacity: this._opacity
        };

        if (this._pane) {
            config.pane = this._pane.name;
        }

        return L.polyline([[this.location.y, this.location.x], ...this._points], config);
    }
}
