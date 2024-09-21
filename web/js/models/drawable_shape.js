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

    getCssRule(selector) {
        for (let i = 0; i < document.styleSheets.length; i++) {
            const rules = document.styleSheets[i].cssRules;
            for (let x = 0; x < rules.length; x++) {
                if (rules[x].selectorText === selector) {
                    return rules[x].style;
                }
            }
        }

        return null; // Return null if no rule found
    }

    setTheme(theme) {
        const style = this.getCssRule(theme);
        if( !style ) {
            return this;
        }

        if( 'borderColor' in style ) {
            this.setBorderColor(style.borderColor);
        }
        
        if( 'fill' in style ) {
            this.setFillColor(style.fill)
        }
        
        if( 'fillOpacity' in style ) {
            this.setFillOpacity(style.fillOpacity);
        }

        return this;
    }
    
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

    draw(map) {
        this.erase();
        super.draw(map);
        this._self = this.drawImplementation();

        if (this._pane && !map.getPane(this._pane.name)) {
            map.createPane(this._pane.name);
            map.getPane(this._pane.name).style.zIndex = this._pane.level;
        }

        this._self.addTo(map);
    }
};