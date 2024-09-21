class Drawable extends NotificationListener {
    constructor() {
        super();
        this._isVisible = false;
    }

    erase() {
        this._isVisible = false;
    }

    draw(map) {
        this._isVisible = true;
    }

    onNotification(topic, data, context) {
        // context is the map in this case.
        if( this._isVisible ) {
            context.draw(this);
        }
    }
};