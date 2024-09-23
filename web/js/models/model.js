class Model extends Drawable {
    constructor() {
        super();
        this._shapes = [];
        this._location = new Point();
        this._pane = null;
    }

    get location() {
        return new Point( this._location.x, this._location.y, this._location.z );
    }

    get pane() { return this._pane; }
    
    setPane(value) {
        this._pane = value;

        this._shapes.forEach(shape => {
            shape.setPane(this.pane);
        });       

        return this;
    }

    setLocation(value) {
        this._location = value; 

        this._shapes.forEach(shape => {
            shape.setOffset(this.location);
        });

        return this;
    }

    addShape(shape) {
        shape.setOffset(this.location);
        shape.setPane(this.pane);
        this._shapes.push(shape);
        return this;
    }

    erase() {
        this._shapes.forEach(shape => {
            shape.erase();
        });

        super.erase();
    }

    draw(canvas) {
        super.draw(canvas);
        
        this._shapes.forEach(shape => {
            shape.draw(canvas);
        });
    }
};