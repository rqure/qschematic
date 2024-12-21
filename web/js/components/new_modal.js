function registerNewModalComponent(app, context) {
    return app.component(`new-${context.modalType}-modal`, {
        template: `
<div class="modal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Create ${context.entityType}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="form-floating mb-3">
                    <input type="text" class="form-control" id="nameInput" placeholder="ExampleEntity" v-model="name">
                    <label for="nameInput">Name</label>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-success" data-bs-dismiss="modal" @click="onCreateButtonPressed" :disabled="isCreateDisabled">Create</button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="onCancelButtonPressed">Cancel</button>
            </div>
        </div>
    </div>
</div>`,

        data() {
            db
                .getEventManager()
                .addEventListener(Q_STORE_EVENTS.CONNECTED, this.onStoreConnected.bind(this))
                .addEventListener(Q_STORE_EVENTS.DISCONNECTED, this.onStoreDisconnected.bind(this));

            return {
                name: "",
                shared: context.shared,
                schematicControllerId: null, // Models, schematics, etc. are all under a controller entity.
            }
        },
        
        mounted() {
            if (db.isConnected()) {
                this.onStoreConnected();
            }
        },

        methods: {
            onStoreConnected() {
                

                db
                    .queryAllEntities("SchematicController")
                    .then(result => {
                        if (result.entities.length > 0) {
                            this.schematicControllerId = result.entities[0].getId();
                        } else {
                            qWarn("[NewModal::onDatabaseConnected] No schematic controller found.");
                        }
                    })
                    .catch(err => {
                        qError(`[NewModal::onDatabaseConnected] ${err}`);
                    });
            },

            onStoreDisconnected() {
                
                this.schematicControllerId = null;
            },

            onCreateButtonPressed() {
                db
                    .createEntity(this.schematicControllerId, this.name.trim(), context.entityType)
                    .catch(err => {
                        qError(`[NewModal::onCreateButtonPressed] ${err}`);
                    });
            },

            onCancelButtonPressed() {
                this.name = "";
            },
        },
        computed: {
            isCreateDisabled() {
                return this.name.trim().length == 0 ||
                    !this.schematicControllerId ||
                    this.shared.models.some(model => model.name == this.name) ||
                    this.shared.schematics.some(schematic => schematic.name == this.name);
            }
        }
    })
}