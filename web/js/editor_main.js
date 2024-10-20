async function main() {
    CURRENT_LOG_LEVEL = LOG_LEVELS.DEBUG;

    const database = new DatabaseInteractor({
        port: ":20000"
    });
    database.runInBackground(true);

    let editor;
    function loadMonacoEditor() {
        if (!editor) {
            require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@latest/min/vs' } });
            require(['vs/editor/editor.main'], function () {
                editor = monaco.editor.create(document.getElementById('editorContainer'), {
                    value: 'function helloWorld() {\n   console.log("Hello, world!");\n}',
                    language: 'javascript',
                    theme: 'vs-dark'
                });
            });
        }
    }
    loadMonacoEditor();
}