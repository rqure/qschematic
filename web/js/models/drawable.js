class Drawable {
    constructor() {
        this._isVisible = false;
    }

    erase() {
        this._isVisible = false;
    }

    draw(canvas) {
        this._isVisible = true;
    }
};