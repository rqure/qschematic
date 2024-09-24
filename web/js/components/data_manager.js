
/**
 * Used to manage the data from the database and provide it to the schematic (and models under it).
 */
class DataManager {
    constructor(db) {
        this._db = db;

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
                    .then(source => callback(source));
            })
            .catch(error => {
                qError(`[DataManager::listenForSourceChange] ${error}`);
            });
    }

    findSchematic(schematicId) {
        return this._db
            .queryAllEntities("Schematic")
            .then(result => {
                let readRequests = result.entities.map(schematic => {
                    return {
                        id: schematic.getId(),
                        field: "Identifier"
                    }
                });

                return this._db.read(readRequests);
            })
            .then(readResults => {
                readResults = readResults
                    .map(result => {
                        const protoClass = result.getValue().getTypeName().split('.').reduce((o,i)=> o[i], proto);
                        const value = protoClass.deserializeBinary(result.getValue().getValue_asU8()).getRaw();

                        return {
                            id: result.getId(),
                            field: result.getField(),
                            value: value
                        };
                    })
                    .filter(result => result.value === schematicId);
                
                if (readResults.length === 0) {
                    return Promise.reject("Schematic not found.");
                }

                return this._db.read([{
                    id: readResults[0].id,
                    field: "SourceFile"
                }]);
            })
            .then(readResults => {
                const protoClass = readResults[0].getValue().getTypeName().split('.').reduce((o,i)=> o[i], proto);
                const value = protoClass.deserializeBinary(readResults[0].getValue().getValue_asU8()).getRaw();
                return fetch(value)
                    .then(res => res.blob())
                    .then(blob => blob.text())
                    .then(source => Promise.resolve([readResults[0].getId(), source]));
            })
            .catch(error => {
                throw new Error(`[DataManager::findSchematic] ${error}`);
            });
    }
}