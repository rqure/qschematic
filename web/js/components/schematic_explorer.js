function registerSchematicExplorerComponent(app, context) {
    return app.component('schematic-explorer', {
        data() {
            return {
                models: ['Model 1', 'Model 2'],
                schematics: ['Home', 'Top Floor', 'Basement']
            };
        },

        template: `
            <div>
                <ul class="list-group">
                    <li class="list-group-item">
                        <h5>Schematic Models</h5>
                        <ul class="list-group">
                            <li class="list-group-item" v-for="model in models">{{ model }}</li>
                        </ul>
                    </li>
                    <li class="list-group-item">
                        <h5>Schematics</h5>
                        <ul class="list-group">
                            <li class="list-group-item" v-for="schematic in schematics">{{ schematic }}</li>
                        </ul>
                    </li>
                </ul>
            </div>
        `
    });
}