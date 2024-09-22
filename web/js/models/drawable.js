class Drawable {
    constructor() {
        this._isVisible = false;
    }

    erase() {
        this._isVisible = false;
    }

    draw(map) {
        this._isVisible = true;
    }
};