class Polygon extends DrawableShape {
    constructor() {
        super();
        this._edges = [];
    }

    setOffset(value) {
        for(let i = 0; i < this._edges.length; i++) {
            this._edges[i][0] += value.y + this._offset.y;
            this._edges[i][1] += value.x + this._offset.x;
        }

        super.setOffset(value);
    }

    addEdge(point) { this._edges.push([point.y + this._offset.y, point.x + this._offset.x]); return this; }

    drawImplementation() {
        const config = {
            color: this._color,
            fillColor: this._fillColor,
            fillOpacity: this._fillOpacity
        };

        if (this._pane) {
            config.pane = this._pane.name;
        }

        return L.polygon([[this.location.y, this.location.x], ...this._edges], config);
    }
};