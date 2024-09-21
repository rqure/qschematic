class SvgText extends DrawableShape {
    constructor(text="") {
        super();
        this._element = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this._element.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        this._width = 100;
        this._height = 10;
        this._text = text;
        this._fontSize = '1em';
    }

    get width() { return this._width; }
    get height() { return this._height; }
    get fontSize() { return this._fontSize; }
    get text() { return this._text; }

    setWidth(value) { this._width = value; return this; }
    setHeight(value) { this._height = value; return this; }
    setFontSize(value) { this._fontSize = value; return this; }
    setText(value) { this._text = value; return this; }

    onNotification(topic, data, context) {
        if (data.token === 'Text') {
            this.setText(data.value);
        }

        if (data.token === 'FontSize') {
            this.setFontSize(data.value);
        }

        super.onNotification(topic, data, context);
    }

    drawImplementation() {
        this._element.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
        this._element.innerHTML = `
            <text x="0%" y="95%" style="font-size:${this.fontSize};" fill="${this._fillColor}">${this.text}</text>
        `;

        return L.svgOverlay(this._element, [
            [this.location.y, this.location.x],
            [this.location.y + this.height, this.location.x + this.width]
        ]);
    }
};