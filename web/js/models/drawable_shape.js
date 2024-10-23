
/** Class Name	    CSS Variable
    bg-primary	    --bs-primary
    bg-secondary	--bs-secondary
    bg-success	    --bs-success
    bg-danger	    --bs-danger
    bg-warning	    --bs-warning
    bg-info	        --bs-info
    bg-light	    --bs-light
    bg-dark	        --bs-dark
    bg-body	        --bs-body
    text-primary	--bs-primary
    text-secondary	--bs-secondary
    text-success	--bs-success
    text-danger	    --bs-danger
    text-warning	--bs-warning
    text-info	    --bs-info
    text-light	    --bs-light
    text-dark	    --bs-dark
*/
function getBootstrapVariableColor(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

class DrawableShape extends Drawable {
    constructor() {
        super();
        this._self = null;
        this._color = 'red';
        this._fillColor = '#f03';
        this._fillOpacity = 0.5;
        this._weight = 1;
    }
    
    setColor(value) {
        if (value.startsWith('--')) {
            value = getBootstrapVariableColor(value);
        }

        this._color = value;
        return this;
    }

    setBorderColor(value) {
        if (value.startsWith('--')) {
            value = getBootstrapVariableColor(value);
        }

        this._color = value;
        return this;
    }

    setFillColor(value) {
        if (value.startsWith('--')) {
            value = getBootstrapVariableColor(value);
        }

        this._fillColor = value;
        return this;
    }

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

        if (canvas.zoom < this._minZoom) {
            return;
        }

        super.draw(canvas);
        this._self = this.drawImplementation();

        if (this._pane && !canvas.implementation.getPane(this._pane.name)) {
            canvas.implementation.createPane(this._pane.name);
            canvas.implementation.getPane(this._pane.name).style.zIndex = this._pane.level;
        }

        this._self.addTo(canvas.implementation);
    }
};