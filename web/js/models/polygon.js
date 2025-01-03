class Polygon extends DrawableShape {
    constructor() {
        super();
        this._edges = [];
    }

    get transformed_edges() {
        return this._edges.map(point => {
            // Step 1: Apply scaling relative to the origin
            const scaledX = point.x * this.absolute_scale.x;
            const scaledY = point.y * this.absolute_scale.y;

            // Step 2: Apply rotation around the origin
            const radians = this.absolute_rotation * (Math.PI / 180);
            const rotatedX = Math.cos(radians) * scaledX - Math.sin(radians) * scaledY;
            const rotatedY = Math.sin(radians) * scaledX + Math.cos(radians) * scaledY;

            // Step 3: Apply translation (offset)
            const offset = this.absolute_offset;
            const finalX = rotatedX + offset.x;
            const finalY = rotatedY + offset.y;
            const finalZ = point.z + offset.z;

            return new Point(finalX, finalY, finalZ);
        });
    }

    addEdge(point) {
        this._edges.push(point);

        return this;
    }

    drawImplementation() {
        const config = {
            className: this._className || '',
            color: this._color,
            fillColor: this._fillColor,
            fillOpacity: this._fillOpacity
        };

        if (this._pane) {
            config.pane = this._pane.name;
        }

        return L.polygon([...this.transformed_edges.map(p => [p.y, p.x])], config);
    }
};