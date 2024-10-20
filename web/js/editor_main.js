async function main() {
    CURRENT_LOG_LEVEL = LOG_LEVELS.DEBUG;

    const app = Vue.createApp({
        data() {
            return {};
        },
    });

    const database = new DatabaseInteractor({
        port: ":20000"
    });
    database.runInBackground(true);

    registerSchematicExplorerComponent(app, {
        qDatabaseInteractor: database
    });

    registerEditorContainerComponent(app, {});

    app.mount('#desktop');
}