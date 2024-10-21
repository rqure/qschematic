function registerEditorContainerComponent(app, context) {
    return app.component('editor-container', {
        data() {
            return {
                shared: context.shared,
                database: context.database,
            };
        },

        mounted() {
            require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@latest/min/vs' } });
            require(['vs/editor/editor.main'], () => {
                this.shared.editor = monaco.editor.create(document.getElementById('editorContainer'), {
                    value: "{}",
                    language: 'json',
                    theme: 'vs-dark',
                    readOnly: this.shared.selected === null,
                });
            });
        },

        template: `
            <div id="editorContainer"></div>
        `
    });
}