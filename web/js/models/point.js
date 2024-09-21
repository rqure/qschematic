class Point {
    constructor(x=0, y=0, z=0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set x(value) { this._x = value; }

    set y(value) { this._y = value; }

    set z(value) { this._z = value; }

    get x() { return this._x; }

    get y() { return this._y; }

    get z() { return this._z; }

    plus(point) { return new Point( this.x + point.x, this.y + point.y, this.z + point.z ); }
    minus(point) { return new Point( this.x - point.x, this.y - point.y, this.z - point.z ); }
};