class Model extends Drawable {
    constructor() {
        super();
        this._shapes = [];
    }

    setOffset(value) {
        super.setOffset(value);

        this._shapes.forEach(shape => {
            shape.setOffset(this.offset);
        });

        return this;
    }
    
    setPane(value) {
        super.setPane(value);

        this._shapes.forEach(shape => {
            shape.setPane(this.pane);
        });

        return this;
    }

    setScale(value) {
        super.setScale(value);

        this._shapes.forEach(shape => {
            shape.setScale(this.scale);
        });

        return this;        
    }

    setPivot(value) {
        super.setPivot(value);

        this._shapes.forEach(shape => {
            shape.setPivot(this.pivot);
        });

        return this;
    }

    setRotation(angle) {
        super.setRotation(angle);

        this._shapes.forEach(shape => {
            shape.setRotation(angle);
        });

        return this;
    }

    addShape(shape) {
        shape.setParent(this);
        shape.setPivot(this.pivot);
        shape.setRotation(this.rotation);
        shape.setScale(this.scale);
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