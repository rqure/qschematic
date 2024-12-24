/**
 * Used to manage the data from the Store and provide it to the schematic (and models under it).
 */
class DataManager {
    constructor(store) {
        this._store = store;
        this._handlers = {};
        this._tokens = [];

        this._store
            .getEventManager()
            .addEventListener(Q_STORE_EVENTS.CONNECTED, this.__onStoreConnected.bind(this))
            .addEventListener(Q_STORE_EVENTS.DISCONNECTED, this.__onStoreDisconnected.bind(this));
    }

    get writer() {
        return new DataWriter(this);
    }

    __onStoreConnected() {
        qInfo("[DataManager::__onStoreConnected] Connected to Store.");
    }

    __onStoreDisconnected() {
    }

    notify(entityIdField, handler) {
        qTrace(`[DataManager::notify] Registering handler for ${entityIdField}.`);

        const [entityId, field] = entityIdField.split('->');

        if( !this._handlers[entityIdField] || this._handlers[entityIdField].length === 0 ) {
            this._handlers[entityIdField] = [];

            this._store
                .registerNotifications([{
                    id: entityId,
                    field: field,
                }], notification => {
                    const field = notification.getCurrent();
                    const protoClass = field.getValue().getTypeName().split('.').reduce((o,i)=> o[i], proto);
                    const value = protoClass.deserializeBinary(field.getValue().getValue_asU8()).getRaw();
    
                    qTrace(`[DataManager::notify] Notifying handler for ${entityIdField}.`);
    
                    this._handlers[entityIdField].forEach(h => h(value, true));
                })
                .then(registerResult => {
                    registerResult.tokens.forEach(token => this.__addToken(token));
                });
        }

        this._handlers[entityIdField].push(handler);

        this._store
            .read([{
                id: entityId,
                field: field,
            }])
            .then(result => {
                result = result[0];

                const protoClass = result.getValue().getTypeName().split('.').reduce((o, i) => o[i], proto);
                const value = protoClass.deserializeBinary(result.getValue().getValue_asU8()).getRaw();

                qTrace(`[DataManager::notify] Read handler for ${entityIdField}.`);

                this._handlers[entityIdField].forEach(h => h(value, false));
            });
    }

    __addToken(token) {
        this._tokens = this._tokens.filter(t => t !== token);
        this._tokens.push(token);
    }

    unnotify(entityIdField, handler) {
        if( this._handlers[entityIdField] ) {
            qDebug(`[DataManager::unnotify] Unregistering handler for ${entityIdField}.`);
            this._handlers[entityIdField] = this._handlers[entityIdField].filter(h => h !== handler);
        } else {
            qWarn(`[DataManager::unnotify] No handlers for ${entityIdField}.`);
        }
    }

    unnotifyAll() {
        qTrace(`[DataManager::unnotifyAll] Unnotifying all.`);

        return this._store
            .unregisterNotifications(this._tokens)
            .then(() => { 
                this._tokens = [];
            });
    }

    listenForSourceChange(id, callback) {
        this._store
            .registerNotifications([{
                id: id,
                field: "SourceFile",
            }], notification => {
                const field = notification.getCurrent();
                const protoClass = field.getValue().getTypeName().split('.').reduce((o,i)=> o[i], proto);
                const value = protoClass.deserializeBinary(field.getValue().getValue_asU8()).getRaw();

                return fetch(value)
                    .then(res => res.blob())
                    .then(blob => blob.text())
                    .then(source => callback(JSON.parse(source)));
            })
            .then(registerResult => {
                registerResult.tokens.forEach(token => this.__addToken(token));
            })
            .catch(error => {
                qError(`[DataManager::listenForSourceChange] ${error}`);
            });
    }

    findModels() {
        return this._store
            .queryAllEntities("SchematicModel")
            .then(result => {
                const readRequests = [];
                const id2Name = {};
                
                result.entities.forEach(model => {
                    readRequests.push({
                        id: model.getId(),
                        field: "SourceFile"
                    });

                    id2Name[model.getId()] = model.getName();
                });

                return this._store.read(readRequests)
                    .then(readResults => [readResults, id2Name]);
            })
            .then((args) => {
                const [readResults, id2Name] = args;
                const unresolvedModels = readResults.reduce((accumulator, result) => {
                    const protoClass = result.getValue().getTypeName().split('.').reduce((o, i) => o[i], proto);
                    const id = result.getId();
                    const field = result.getField();
                    const value = protoClass.deserializeBinary(result.getValue().getValue_asU8()).getRaw();

                    if (!accumulator[id]) {
                        accumulator[id] = {};
                        accumulator[id].identifier = id2Name[id];
                    }

                    if (field === "SourceFile") {
                        if (value === "") {
                            qWarn(`[DataManager::findModels] Source file not found for model ${id}.`);
                            accumulator[id].unresolvedSource = Promise.resolve([id, {}]);
                        } else {
                            accumulator[id].unresolvedSource = fetch(value)
                                .then(res => res.blob())
                                .then(blob => blob.text())
                                .then(source => {
                                    try {
                                        return [ id, JSON.parse(source) ]
                                    }
                                    catch (error) {
                                        qWarn(`[DataManager::findModels] Error while parsing source file: ${error}`);
                                        return [ id, {} ];
                                    }
                                });
                        }
                    }
    
                    return accumulator;
                }, {});

                return Promise
                    .all(Object.values(unresolvedModels).map(m => m.unresolvedSource))
                    .then(resolvedSources => {
                        return resolvedSources.map(resolvedSource => {
                            const [id, source] = resolvedSource;
                            const identifier = unresolvedModels[id].identifier;
                            return [id, identifier, source];
                        });
                    });
            })
            .catch(error => {
                throw new Error(`[DataManager::findModels] ${error}`);
            });
    }

    findSchematic(schematicId) {
        return this._store
            .queryAllEntities("Schematic")
            .then(schematics => {
                schematics = schematics.entities.filter(schematic => schematic.getName() === schematicId);
                
                if (schematics.length === 0) {
                    return Promise.reject("Schematic not found.");
                }

                return this._store.read([{
                    id: schematics[0].getId(),
                    field: "SourceFile"
                }]);
            })
            .then(readResults => {
                const protoClass = readResults[0].getValue().getTypeName().split('.').reduce((o,i)=> o[i], proto);
                const value = protoClass.deserializeBinary(readResults[0].getValue().getValue_asU8()).getRaw();
                return fetch(value)
                    .then(res => res.blob())
                    .then(blob => blob.text())
                    .then(source => [readResults[0].getId(), JSON.parse(source)]);
            })
            .catch(error => {
                throw new Error(`[DataManager::findSchematic] ${error}`);
            });
    }

    write(entityIdField, value) {
        const [entityId, field] = entityIdField.split('->');

        this._store
            .read([{
                id: entityId,
                field: field,
            }])
            .then(result => {
                result = result[0];

                let protoClass = result.getValue().getTypeName().split('.').reduce((o, i) => o[i], proto);
                if (protoClass === proto.protobufs.Transformation) {
                    qInfo(`[DataManager::write] Transformation detected. Overriding as String.`);
                    protoClass = proto.protobufs.String;
                }

                const valueContainer = protoClass.deserializeBinary(result.getValue().getValue_asU8());
                valueContainer.setRaw(value);
                const valueAsAny = new proto.google.protobuf.Any();
                valueAsAny.pack(valueContainer.serializeBinary(), qMessageType(valueContainer));

                return this._store.write([{
                    id: entityId,
                    field: field,
                    value: valueAsAny,
                }])
                .then(() => qInfo(`[DataManager::write] Successfully wrote to ${entityIdField}.`))
                .catch(error => {
                    qError(`[DataManager::write] Error while writing to ${entityIdField}: ${error}`);
                });
            })
            .catch(error => {
                qError(`[DataManager::write] Error while reading from ${entityIdField}: ${error}`);
            });
    }
}

class DataWriter {
    constructor(dataManager) {
        this._dataManager = dataManager;
    }

    write(entityIdField, value) {
        this._dataManager.write(entityIdField, value);
    }
}