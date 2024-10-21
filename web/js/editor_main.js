const db = new DatabaseInteractor({
    port: ":20000"
});

let editor = null;

async function main() {
    CURRENT_LOG_LEVEL = LOG_LEVELS.DEBUG;

    const app = Vue.createApp({});

    db.runInBackground(true);

    const shared = Vue.reactive({
        selected: null,
        models: [],
        schematics: []
    });

    registerSchematicExplorerComponent(app, {
        shared: shared,
    });

    registerEditorContainerComponent(app, {
        shared: shared,
    });

    registerNewModalComponent(app, {
        modalType: "schematic",
        entityType: "Schematic",
        shared: shared,
    });

    registerNewModalComponent(app, {
        modalType: "model",
        entityType: "SchematicModel",
        shared: shared,
    });

    registerSaveToastComponent(app, {
        shared: shared,
    });

    app.mount('#desktop');
}