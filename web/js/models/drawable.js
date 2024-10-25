class Drawable {
    constructor() {
        this._isVisible = false;
        this._offset = new Point();
        this._pane = null;
        this._pivot = new Point();
        this._rotation = 0;
        this._scale = new Point(1, 1, 1);
        this._minZoom = 0;
        this._parent = null;
        this._ondestroy = new CustomEvent();
        this._writer = null;
        this._navigator = null;
    }

    get writer() { return this._writer; }

    get navigator() { return this._navigator; }

    get parent() {
        return this._parent;
    }

    get pivot() {
        return this._pivot;
    }

    get rotation() {
        return this._rotation;
    }

    get absolute_rotation() {
        if (this._parent) {
            return this._parent.absolute_rotation + this._rotation;
        }

        return this._rotation;
    }

    get scale() {
        return this._scale;
    }

    get absolute_scale() {
        if (this._parent) {
            const parentScale = this._parent.absolute_scale;
            return new Point(
                parentScale.x * this._scale.x,
                parentScale.y * this._scale.y,
                parentScale.z * this._scale.z
            );
        }

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
        const scale = this.absolute_scale;
        const scaledX = pivot.x * scale.x;
        const scaledY = pivot.y * scale.y;
    
        // Apply rotation to the scaled point
        const radians = this.absolute_rotation * (Math.PI / 180);
        const rotatedX = Math.cos(radians) * scaledX - Math.sin(radians) * scaledY;
        const rotatedY = Math.sin(radians) * scaledX + Math.cos(radians) * scaledY;
    
        // Apply translation (offset)
        const offset = this.absolute_offset;
        const finalX = rotatedX + offset.x;
        const finalY = rotatedY + offset.y;
    
        return new Point(finalX, finalY, pivot.z + offset.z);
    }

    get pane() { return this._pane; }

    get ondestroy() { return this._ondestroy;}

    get minZoom() { return this._minZoom; }

    setParent(parent) { this._parent = parent; return this; }
    setScale(scale) { this._scale = scale; return this; }
    setPivot(pivot) { this._pivot = pivot; return this; }
    setRotation(angle) { this._rotation = angle; return this; }
    setOffset(value) { this._offset = value; return this; }
    setPane(value) { this._pane = value; return this; }
    setMinZoom(value) { this._minZoom = value; return this; }
    setWriter(writer) { this._writer = writer; return this; }
    setNavigator(navigator) { this._navigator = navigator; return this; }

    erase() {
        this._isVisible = false;
    }

    draw(canvas) {
        this._isVisible = true;
    }

    destroy() {
        this._ondestroy.callbacks.forEach(callback => callback());
        this._ondestroy.clear();

        this.setParent(null);
    }
};