async function main() {
    CURRENT_LOG_LEVEL=LOG_LEVELS.DEBUG;

    const app = Vue.createApp({});
    app.mount('#desktop');
    
    const database = new DatabaseInteractor({
        port: ":20000"
    });
    database.runInBackground(true);

    const canvas = new Canvas('schematic');
    canvas.setBoundary({x: 0, y: 0}, {x: 1000, y: 1000}).moveTo(map.center);

    const schematic = new Schematic(canvas, database);
}