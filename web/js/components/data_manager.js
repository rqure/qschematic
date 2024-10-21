/**
 * Used to manage the data from the database and provide it to the schematic (and models under it).
 */
class DataManager {
    constructor(db) {
        this._db = db;
        this._handlers = {};

        this._db
            .getEventManager()
            .addEventListener(DATABASE_EVENTS.CONNECTED, this.__onDatabaseConnected.bind(this))
            .addEventListener(DATABASE_EVENTS.DISCONNECTED, this.__onDatabaseDisconnected.bind(this));
    }

    __onDatabaseConnected() {
        qInfo("[DataManager::__onDatabaseConnected] Connected to database.");
    }

    __onDatabaseDisconnected() {
    }

    notify(entityIdField, handler) {
        qTrace(`[DataManager::notify] Registering handler for ${entityIdField}.`);

        if( !this._handlers[entityIdField] ) {
            this._handlers[entityIdField] = [];
        }

        this._handlers[entityIdField].push(handler);

        const [entityId, field] = entityIdField.split('->');
        this._db
            .registerNotifications([{
                id: entityId,
                field: field,
            }], notification => {
                const field = notification.getCurrent();
                const protoClass = field.getValue().getTypeName().split('.').reduce((o,i)=> o[i], proto);
                const value = protoClass.deserializeBinary(field.getValue().getValue_asU8()).getRaw();

                qTrace(`[DataManager::notify] Notifying handler for ${entityIdField}.`);

                handler(value);
            });
        
        this._db
            .read([{
                id: entityId,
                field: field,
            }])
            .then(result => {
                result = result[0];

                const protoClass = result.getValue().getTypeName().split('.').reduce((o, i) => o[i], proto);
                const value = protoClass.deserializeBinary(result.getValue().getValue_asU8()).getRaw();

                qTrace(`[DataManager::notify] Read handler for ${entityIdField}.`);

                handler(value);
            });
    }

    unnotify(entityIdField, handler) {
        if( this._handlers[entityIdField] ) {
            this._handlers[entityIdField] = this._handlers[entityIdField].filter(h => h !== handler);
        }
    }

    listenForSourceChange(id, callback) {
        this._db
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
            .catch(error => {
                qError(`[DataManager::listenForSourceChange] ${error}`);
            });
    }

    findModels() {
        return this._db
            .queryAllEntities("SchematicModel")
            .then(result => {
                const readRequests = [];

                result.entities.forEach(model => {
                    readRequests.push({
                        id: model.getId(),
                        field: "SourceFile"
                    });
                });

                return this._db.read(readRequests);
            })
            .then(readResults => {
                const unresolvedModels = readResults.reduce((accumulator, result) => {
                    const protoClass = result.getValue().getTypeName().split('.').reduce((o, i) => o[i], proto);
                    const id = result.getId();
                    const name = result.getName();
                    const field = result.getField();
                    const value = protoClass.deserializeBinary(result.getValue().getValue_asU8()).getRaw();

                    if (!accumulator[id]) {
                        accumulator[id] = {};
                        accumulator[id].identifier = name;
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
        return this._db
            .queryAllEntities("Schematic")
            .then(schematics => {
                schematics = schematics.entities.filter(schematic => schematic.getName() === schematicId);
                
                if (schematics.length === 0) {
                    return Promise.reject("Schematic not found.");
                }

                return this._db.read([{
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
}