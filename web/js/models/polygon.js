class Polygon extends DrawableShape {
    constructor() {
        super();
        this._edges = [];
    }

    setLocation(location) {
        this._edges.forEach(point => {
            point.x = point.x - this._location.x + location.x;
            point.y = point.y - this._location.y + location.y;
            point.z = point.z - this._location.z + location.z;
        });

        super.setLocation(location);
    }

    setOffset(offset) {
        this._edges.forEach(point => {
            point.x = point.x - this._offset.x + offset.x;
            point.y = point.y - this._offset.y + offset.y;
            point.z = point.z - this._offset.z + offset.z;
        });

        super.setOffset(offset);
    }

    addEdge(point) {
        this._edges.push(new Point(
            this.location.x + point.x,
            this.location.y + point.y));

        return this;
    }

    drawImplementation() {
        const config = {
            color: this._color,
            fillColor: this._fillColor,
            fillOpacity: this._fillOpacity
        };

        if (this._pane) {
            config.pane = this._pane.name;
        }

        return L.polygon([...this._edges.map(p => [p.y, p.x])], config);
    }
};