async function main() {
    const app = Vue.createApp({});
    
    const context = {
        qDatabaseInteractor: new DatabaseInteractor(),
    };

    app.mount('#desktop');

    const map = new SimpleMap('schematic');
    
    map.setBoundary({x: 0, y: 0}, {x: 1000, y: 1000}).moveTo(map.center);
    // map.draw(
    //     new Schematic("home", context.qDatabaseInteractor)
    // );

    context.qDatabaseInteractor.runInBackground(true);

    CURRENT_LOG_LEVEL=LOG_LEVELS.DEBUG;

    const dataManager = new DataManager(context.qDatabaseInteractor);
    console.log(dataManager.findSchematic("home"));
}