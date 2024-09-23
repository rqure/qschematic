class Schematic {
    constructor(canvas) {
        super();
        this._identifier = null;
        this._canvas = canvas;
        this._model = null;
    }

    setIdentifer(value) {
        this._identifier = value;

        return this;
    }
}