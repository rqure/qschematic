function registerEditorContainerComponent(app, context) {
    return app.component('editor-container', {
        data() {
            return {
                shared: context.shared,
            };
        },

        methods: {
            onSaveButtonPressed() {
                if (!this.shared.selected || !editor) {
                    return;
                }
        
                qDebug(`[EditorContainer::onSaveButtonPressed] Saving entity ${this.shared.selected.id}.`);
        
                async function bufferToBase64(buffer) {
                    const base64url = await new Promise(r => {
                      const reader = new FileReader();
                      reader.onload = () => r(reader.result);
                      reader.readAsDataURL(new Blob([buffer]));
                    });
                    return base64url;
                }
        
                const reader = new FileReader();
                reader.onload = async (e) => { 
                    const content = await bufferToBase64(new Uint8Array(e.target.result));
                    const value = new proto.protobufs.BinaryFile();
                    value.setRaw(content);
                    const valueAsAny = new proto.google.protobuf.Any();
                    valueAsAny.pack(value.serializeBinary(), qMessageType(value));
        
                    db.write([ 
                        {
                            id: this.shared.selected.id,
                            field: 'SourceFile',
                            value: valueAsAny
                        }
                    ])
                    .then(() => {
                        qDebug(`[EditorContainer::onSaveButtonPressed] Successfully saved entity ${this.shared.selected.id}.`);
                        const toast = bootstrap.Toast.getOrCreateInstance(document.getElementById('save-toast'));
                        toast.show();
                    })
                    .catch(error => qError(`[EditorContainer::onSaveButtonPressed] ${error}`));
                };
                
                reader.readAsArrayBuffer(new Blob([editor.getValue()]));
            }
        },

        mounted() {
            document.addEventListener("keydown", (e) => {
                if ((e.metaKey || e.ctrlKey) && e.code === "KeyS") {
                    e.preventDefault(); 
                    this.onSaveButtonPressed();
                }
            }, false);

            require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@latest/min/vs' } });
            require(['vs/editor/editor.main'], () => {
                editor = monaco.editor.create(document.getElementById('editorContainer'), {
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