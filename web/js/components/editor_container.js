function registerEditorContainerComponent(app, context) {
    return app.component('editor-container', {
        data() {
            return {
                editor: null
            };
        },

        mounted() {
            require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@latest/min/vs' } });
            require(['vs/editor/editor.main'], () => {
                this.editor = monaco.editor.create(document.getElementById('editorContainer'), {
                    value: "// Your code goes here...",
                    language: 'javascript',
                    theme: 'vs-dark'
                });
            });
        },
        template: `
            <div id="editorContainer"></div>
        `
    });
}