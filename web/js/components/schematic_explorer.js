function registerSchematicExplorerComponent(app, context) {
    return app.component('schematic-explorer', {
        data() {
            context.database
                .getEventManager()
                .addEventListener(DATABASE_EVENTS.CONNECTED, this.onDatabaseConnected.bind(this))
                .addEventListener(DATABASE_EVENTS.DISCONNECTED, this.onDatabaseDisconnected.bind(this));

            return {
                db: context.database,
                isDatabaseConnected: false,
                models: [],
                schematics: []
            };
        },

        mounted() {
            if (this.db.isConnected()) {
                this.onDatabaseConnected();
            }
        },

        methods: {
            onDatabaseConnected() {        
                this.isDatabaseConnected = true;

                this.db.registerNotifications([
                    { type: 'Root', field: 'SchemaUpdateTrigger' },
                ], (n) => {
                    this.findAll('SchematicModel').then(models => this.models = models);
                    this.findAll('Schematic').then(schematics => this.schematics = schematics);
                });
            },

            onDatabaseDisconnected() {
                this.isDatabaseConnected = false;
            },

            findAll(entityType) {
                return this.db
                    .queryAllEntities(entityType)
                    .then(models => models.map(model => {
                            return { id: model.getId(), field: 'Identifier' }
                    }))
                    .then(fields => this.db.read(fields))
                    .then(results => results.map(result => {
                        const protoClass = result.getValue().getTypeName().split('.').reduce((o, i) => o[i], proto);
                        const value = protoClass.deserializeBinary(result.getValue().getValue_asU8()).getRaw();
                        return { id: result.getId(), name: value };
                    }))
                    .catch(err => {
                        qError(`[SchematicExplorer::findAllModels] ${err}`);
                    });
            },

            onDeleteModel(model) {

            },

            onDeleteSchematic(schematic) {

            }
        },

        template: `
            <ul class="list-group list-group-flush">
                <li class="list-group-item active">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">Models</h5>
                        <button type="button" class="btn btn-light" data-bs-toggle="modal" data-bs-target="#new-model-modal">New</button>
                    </div>
                </li>
                <li class="list-group-item list-group-item-action d-flex justify-content-between align-items-start" v-for="model in models">
                    {{ model.name }}
                    <span class="badge text-bg-secondary" @click="onDeleteModel(model)">🗑</span>
                </li>
                <li class="list-group-item active">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">Schematics</h5>
                        <button type="button" class="btn btn-light" data-bs-toggle="modal" data-bs-target="#new-schematic-modal">New</button>
                    </div>
                </li>
                <li class="list-group-item list-group-item-action d-flex justify-content-between align-items-start" v-for="schematic in schematics">
                    {{ schematic.name }}
                    <span class="badge text-bg-secondary" @click="onDeleteSchematic(schematic)">🗑</span>
                </li>
            </ul>
        `
    });
}