function registerSchematicExplorerComponent(app, context) {
    return app.component('schematic-explorer', {
        data() {
            Q_STORE
                .getEventManager()
                .addEventListener(Q_STORE_EVENTS.CONNECTED, this.onStoreConnected.bind(this))
                .addEventListener(Q_STORE_EVENTS.DISCONNECTED, this.onStoreDisconnected.bind(this));

            return {
                shared: context.shared,
            };
        },

        mounted() {
            if (Q_STORE.isConnected()) {
                this.onStoreConnected();
            }
        },

        methods: {
            onStoreConnected() {        
                Q_STORE.registerNotifications([
                    { type: 'Root', field: 'SchemaUpdateTrigger' },
                ], (n) => {
                    qDebug(`[SchematicExplorer::onDatabaseConnected] Schema has changed. Finding any new schematic related entities.`);
                    this.findAll('SchematicModel').then(models => this.shared.models = models.toSorted((a, b) => ('' + a.name).localeCompare(b.name)));
                    this.findAll('Schematic').then(schematics => this.shared.schematics = schematics.toSorted((a, b) => ('' + a.name).localeCompare(b.name)));
                });

                this.findAll('SchematicModel').then(models => this.shared.models = models.toSorted((a, b) => ('' + a.name).localeCompare(b.name)));
                this.findAll('Schematic').then(schematics => this.shared.schematics = schematics.toSorted((a, b) => ('' + a.name).localeCompare(b.name)));
            },

            onStoreDisconnected() {
                
            },

            findAll(entityType) {
                return Q_STORE
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

                    if (editor) {
                        editor.setValue("{}");
                        editor.updateOptions({ readOnly: true });
                    }

                    Q_STORE
                        .deleteEntity(entity.id)
                        .then(() => {
                            qDebug(`[SchematicExplorer::onDelete] Successfully deleted entity ${entity.id}.`);
                        })
                        .catch(err => {
                            qError(`[SchematicExplorer::onDelete] ${err}`);
                        });
                }
            },

            onSelect(entity) {
                this.shared.selected = entity;

                if (editor) {
                    editor.updateOptions({ readOnly: false });

                    Q_STORE
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
            <ul class="list-group list-group-flush overflow-y-auto">
                <li class="list-group-item active">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">Models</h5>
                        <button type="button" class="btn btn-light" data-bs-toggle="modal" data-bs-target="#new-model-modal">New</button>
                    </div>
                </li>
                <li class="list-group-item list-group-item-action list-group-item-secondary d-flex justify-content-between align-items-start" v-for="model in shared.models" v-bind:class="{ 'active': (model === shared.selected) }" @click="onSelect(model)">
                    {{ model.name }}
                    <button type="button" class="btn btn-light" @click="onDelete(model)">🗑</button>
                </li>
                <li class="list-group-item active">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">Schematics</h5>
                        <button type="button" class="btn btn-light" data-bs-toggle="modal" data-bs-target="#new-schematic-modal">New</button>
                    </div>
                </li>
                <li class="list-group-item list-group-item-action list-group-item-secondary d-flex justify-content-between align-items-start" v-for="schematic in shared.schematics" v-bind:class="{ 'active': (schematic === shared.selected) }" @click="onSelect(schematic)">
                    {{ schematic.name }}
                    <button type="button" class="btn btn-light" @click="onDelete(schematic)">🗑</button>
                </li>
            </ul>
        `
    });
}