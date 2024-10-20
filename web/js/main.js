async function main() {
    CURRENT_LOG_LEVEL=LOG_LEVELS.DEBUG;
    
    const database = new DatabaseInteractor({
        port: ":20000"
    });
    database.runInBackground(true);

    const canvas = new Canvas('schematic');
    canvas
        .setMinZoom(1)
        .setMaxZoom(10)
        .setBoundary({x: 0, y: 0}, {x: 1000, y: 1000})
        .moveTo(canvas.center, 5);

    const coordinates = document.getElementById('coordinates');
    canvas.onmousemove = (point) => {
        coordinates.innerHTML = `X: ${point.x}, Y: ${point.y}`;
    };

    const schematic = new Schematic(canvas, database);
    schematic.setIdentifer("home");
}