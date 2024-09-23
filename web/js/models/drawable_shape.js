class DrawableShape extends Drawable {
    constructor() {
        super();
        this._self = null;
        this._location = new Point();
        this._offset = new Point();
        this._color = 'red';
        this._fillColor = '#f03';
        this._fillOpacity = 0.5;
        this._pane = null;
    }

    get location() { return new Point( this._location.x + this._offset.x, this._location.y + this._offset.y, this._location.z ); }

    get pane() { return this._pane; }
    
    setOffset(value) { this._offset = value; return this; }
    setLocation(value) { this._location = value; return this; }
    setBorderColor(value) { this._color = value; return this; }
    setFillColor(value) { this._fillColor = value; return this; }
    setFillOpacity(value) { this._fillOpacity = value; return this; }
    setPane(value) { this._pane = value; return this; }

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