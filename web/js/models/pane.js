class Pane {
    constructor(name, level) {
        this._name = name;
        this._level = level;
    }

    get name() { return this._name; }
    get level() { return this._level; }
}