class Drawable {
    constructor() {
        this._isVisible = false;
        this._offset = new Point();
        this._pane = null;
        this._pivot = new Point();
        this._rotation = 0;
        this._scale = new Point(1, 1, 1);
        this._parent = null;
    }

    get parent() {
        return this._parent;
    }

    get pivot() {
        return this._pivot;
    }

    get rotation() {
        return this._rotation;
    }

    get scale() {
        return this._scale;
    }

    get offset() {
        return this._offset;
    }

    get absolute_offset() {
        if (this._parent) {
            const parentOffset = this._parent.absolute_offset;
            return new Point(
                parentOffset.x + this._offset.x,
                parentOffset.y + this._offset.y,
                parentOffset.z + this._offset.z
            );
        }

        return this._offset;
    }

    get location() {
        const pivot = this._pivot;

        // Apply scaling to the pivot
        const scaledX = pivot.x * this._scale.x;
        const scaledY = pivot.y * this._scale.y;
    
        // Apply rotation to the scaled point
        const radians = this._rotation * (Math.PI / 180);
        const rotatedX = Math.cos(radians) * scaledX - Math.sin(radians) * scaledY;
        const rotatedY = Math.sin(radians) * scaledX + Math.cos(radians) * scaledY;
    
        // Apply translation (offset)
        const finalX = rotatedX + this.absolute_offset.x;
        const finalY = rotatedY + this.absolute_offset.y;
    
        return new Point(finalX, finalY, pivot.z + this._offset.z);
    }

    get pane() { return this._pane; }

    setParent(parent) { this._parent = parent; return this; }
    setScale(scale) { this._scale = scale; return this; }
    setPivot(pivot) { this._pivot = pivot; return this; }
    setRotation(angle) { this._rotation = angle; return this; }
    setOffset(value) { this._offset = value; return this; }
    setPane(value) { this._pane = value; return this; }

    erase() {
        this._isVisible = false;
    }

    draw(canvas) {
        this._isVisible = true;
    }
};