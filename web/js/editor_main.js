async function main() {
    CURRENT_LOG_LEVEL = LOG_LEVELS.DEBUG;

    const app = Vue.createApp({});

    const database = new DatabaseInteractor({
        port: ":20000"
    });
    database.runInBackground(true);

    registerSchematicExplorerComponent(app, {
        database: database
    });

    registerEditorContainerComponent(app, {
        database: database
    });

    registerNewModalComponent(app, {
        modalType: "schematic",
        entityType: "Schematic",
        database: database
    });

    registerNewModalComponent(app, {
        modalType: "model",
        entityType: "SchematicModel",
        database: database
    });

    app.mount('#desktop');
}