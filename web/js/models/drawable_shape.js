class DrawableShape extends Drawable {
    constructor() {
        super();
        this._self = null;
        this._color = 'red';
        this._fillColor = '#f03';
        this._fillOpacity = 0.5;
        this._weight = 1;
    }
    
    setColor(value) { this._color = value; return this; }
    setBorderColor(value) { this._color = value; return this; }
    setFillColor(value) { this._fillColor = value; return this; }
    setFillOpacity(value) { this._fillOpacity = value; return this; }
    setWeight(value) { this._weight = value; return this; }

    drawImplementation() {}

    erase() {
        if (this._self !== null) {
            this._self.remove();
            this._self = null;
        }

        super.erase();
    }

    draw(canvas) {
        this.erase();
        super.draw(canvas);
        this._self = this.drawImplementation();

        if (this._pane && !canvas.implementation.getPane(this._pane.name)) {
            canvas.implementation.createPane(this._pane.name);
            canvas.implementation.getPane(this._pane.name).style.zIndex = this._pane.level;
        }

        this._self.addTo(canvas.implementation);
    }
};