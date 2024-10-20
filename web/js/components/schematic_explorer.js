function registerSchematicExplorerComponent(app, context) {
    return app.component('schematic-explorer', {
        data() {
            return {
                models: ['Model 1', 'Model 2'],
                schematics: ['Home', 'Top Floor', 'Basement']
            };
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
                    {{ model }}
                    <span class="badge text-bg-secondary" @click="onDeleteModel(model)">🗑</span>
                </li>
                <li class="list-group-item active">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">Schematics</h5>
                        <button type="button" class="btn btn-light" data-bs-toggle="modal" data-bs-target="#new-schematic-modal">New</button>
                    </div>
                </li>
                <li class="list-group-item list-group-item-action d-flex justify-content-between align-items-start" v-for="schematic in schematics">
                    {{ schematic }}
                    <span class="badge text-bg-secondary" @click="onDeleteSchematic(schematic)">🗑</span>
                </li>
            </ul>
        `
    });
}