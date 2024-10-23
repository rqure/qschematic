class CustomEvent {
    constructor() {
        this._callbacks = [];
    }

    get callbacks() {
        return this._callbacks;
    }

    add(callback) {
        this._callbacks.push(callback);
    }

    remove(callback) {
        this._callbacks = this._callbacks.filter(cb => cb !== callback);
    }

    clear() {
        this._callbacks = [];
    }
}