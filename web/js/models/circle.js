class Circle extends DrawableShape {
    constructor() {
        super();
        this._radius = 1;
    }

    setRadius(value) { this._radius = value; return this; }

    drawImplementation() {
        const config = {
            color: this._color,
            fillColor: this._fillColor,
            fillOpacity: this._fillOpacity,
            radius: this._radius
        };

        if (this._pane) {
            config.pane = this._pane.name;
        }

        return L.circle([this.location.y, this.location.x], config);
    }
};