class Model extends Drawable {
    constructor() {
        super();
        this._shapes = [];
    }

    addShape(shape) {
        shape.setParent(this);
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

    destroy() {
        this._shapes.forEach(shape => {
            shape.destroy();
        });

        this._shapes = [];

        super.destroy();
    }
};