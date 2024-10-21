function registerSchematicExplorerComponent(app, context) {
    return app.component('schematic-explorer', {
        data() {
            db
                .getEventManager()
                .addEventListener(DATABASE_EVENTS.CONNECTED, this.onDatabaseConnected.bind(this))
                .addEventListener(DATABASE_EVENTS.DISCONNECTED, this.onDatabaseDisconnected.bind(this));

            return {
                isDatabaseConnected: false,
                shared: context.shared,
            };
        },

        mounted() {
            if (db.isConnected()) {
                this.onDatabaseConnected();
            }
        },

        methods: {
            onDatabaseConnected() {        
                this.isDatabaseConnected = true;

                db.registerNotifications([
                    { type: 'Root', field: 'SchemaUpdateTrigger' },
                ], (n) => {
                    qDebug(`[SchematicExplorer::onDatabaseConnected] Schema has changed. Finding any new schematic related entities.`);
                    this.findAll('SchematicModel').then(models => this.shared.models = models.toSorted((a, b) => ('' + a.name).localeCompare(b.name)));
                    this.findAll('Schematic').then(schematics => this.shared.schematics = schematics.toSorted((a, b) => ('' + a.name).localeCompare(b.name)));
                });

                this.findAll('SchematicModel').then(models => this.shared.models = models.toSorted((a, b) => ('' + a.name).localeCompare(b.name)));
                this.findAll('Schematic').then(schematics => this.shared.schematics = schematics.toSorted((a, b) => ('' + a.name).localeCompare(b.name)));
            },

            onDatabaseDisconnected() {
                this.isDatabaseConnected = false;
            },

            findAll(entityType) {
                return db
                    .queryAllEntities(entityType)
                    .then(result => result.entities.map(entity => {
                        return { id: entity.getId(), name: entity.getName() };
                    }))
                    .catch(err => {
                        qError(`[SchematicExplorer::findAllModels] ${err}`);
                    });
            },

            onDelete(entity) {
                if (this.shared.selected === entity) {
                    this.shared.selected = null;
                }
            },

            onSelect(entity) {
                this.shared.selected = entity;

                if (editor) {
                    editor.updateOptions({ readOnly: false });

                    db
                        .read([{
                            id: entity.id,
                            field: "SourceFile"
                        }])
                        .then(readResults => {
                            const protoClass = readResults[0].getValue().getTypeName().split('.').reduce((o,i)=> o[i], proto);
                            const value = protoClass.deserializeBinary(readResults[0].getValue().getValue_asU8()).getRaw();

                            if (!value) {
                                throw new Error(`[SchematicExplorer::onSelect] Source file not found for entity ${entity.id}.`);
                            }
                            
                            return fetch(value)
                                .then(res => res.blob())
                                .then(blob => blob.text())
                                .then(source => editor.setValue(source));
                        })
                        .catch(err => {
                            editor.setValue("{}");
                            qError(`[SchematicExplorer::onSelect] ${err}`);
                        });
                }
            }
        },

        template: `
            <ul class="list-group list-group-flush">
                <li class="list-group-item active">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">Models</h5>
                        <button type="button" class="btn btn-light" data-bs-toggle="modal" data-bs-target="#new-model-modal" :disabled="!isDatabaseConnected">New</button>
                    </div>
                </li>
                <li class="list-group-item list-group-item-action list-group-item-secondary d-flex justify-content-between align-items-start" v-for="model in shared.models" v-bind:class="{ 'active': (model === shared.selected) }" @click="onSelect(model)">
                    {{ model.name }}
                    <button type="button" class="btn btn-light" @click="onDelete(model)" :disabled="!isDatabaseConnected">🗑</button>
                </li>
                <li class="list-group-item active">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">Schematics</h5>
                        <button type="button" class="btn btn-light" data-bs-toggle="modal" data-bs-target="#new-schematic-modal" :disabled="!isDatabaseConnected">New</button>
                    </div>
                </li>
                <li class="list-group-item list-group-item-action list-group-item-secondary d-flex justify-content-between align-items-start" v-for="schematic in shared.schematics" v-bind:class="{ 'active': (schematic === shared.selected) }" @click="onSelect(schematic)">
                    {{ schematic.name }}
                    <button type="button" class="btn btn-light" @click="onDelete(schematic)" :disabled="!isDatabaseConnected">🗑</button>
                </li>
            </ul>
        `
    });
}