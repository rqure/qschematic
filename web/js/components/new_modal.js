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
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="onCancelButtonPressed">Cancel</button>
                <button type="button" class="btn btn-success" data-bs-dismiss="modal" @click="onCreateButtonPressed" :disabled="isCreateDisabled">Create</button>
            </div>
        </div>
    </div>
</div>`,

        data() {
            context.database
                .getEventManager()
                .addEventListener(DATABASE_EVENTS.CONNECTED, this.onDatabaseConnected.bind(this))
                .addEventListener(DATABASE_EVENTS.DISCONNECTED, this.onDatabaseDisconnected.bind(this));

            return {
                name: "",
                database: context.database,
                isDatabaseConnected: false
            }
        },
        
        mounted() {
            if (this.database.isConnected()) {
                this.onDatabaseConnected();
            }
        },

        methods: {
            onDatabaseConnected() {
                this.isDatabaseConnected = true;
            },

            onDatabaseDisconnected() {
                this.isDatabaseConnected = false;
            },

            onCreateButtonPressed() {
                
            },

            onCancelButtonPressed() {

            },
        },
        computed: {
            isCreateDisabled() {
                return false;
            }
        }
    })
}