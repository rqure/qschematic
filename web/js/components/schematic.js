class Schematic extends Model {
    constructor(canvas) {
        super();
        this._identifier = null;
        this._canvas = canvas;
        
    }

    setIdentifer(value) {
        this._identifier = value;

        return this;
    }
}