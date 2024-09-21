class Text extends Polygon {
    constructor(text="") {
        super();
        this._text = text;
        this._direction = "center";
        this._className = "default-tooltip-md-font";
        this.setFillOpacity(0)
            .setFillColor('transparent')
            .setBorderColor('transparent');
    }

    get text() { return this._text; }
    get direction() { return this._direction; }
    get className() { return this._className; }

    setText(value) { this._text = value; return this; }
    setDirection(value) { this._direction = value; return this; }
    setClassName(value) { this._className = value; return this; }

    onNotification(topic, data, context) {
        if (data.token === 'Text') {
            this.setText(data.value);
        }

        super.onNotification(topic, data, context);
    }

    drawImplementation() {
        const polygon = super.drawImplementation();
        polygon.bindTooltip(this.text, { permanent: true, direction: this.direction, className: this.className });
        return polygon;
    }
};