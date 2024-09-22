
class Schematic extends Model {
    constructor(identifier, db) {
        super();
        this._identifier = identifier;
        this._isDatabaseConnected = false;
        this._db = db;
        this._notificationTokens = [];

        this.db
            .getEventManager()
            .addEventListener(DATABASE_EVENTS.CONNECTED, this.onDatabaseConnected.bind(this))
            .addEventListener(DATABASE_EVENTS.DISCONNECTED, this.onDatabaseDisconnected.bind(this))
            .addEventListener(DATABASE_EVENTS.QUERY_ENTITY, this.onQueryEntity.bind(this))
            .addEventListener(DATABASE_EVENTS.READ_RESULT, this.onRead.bind(this))
            .addEventListener(DATABASE_EVENTS.REGISTER_NOTIFICATION_RESPONSE, this.onRegisterNotification.bind(this))
            .addEventListener(DATABASE_EVENTS.NOTIFICATION, this.onNotification.bind(this));
    }

    onDatabaseConnected() {
        this._isDatabaseConnected = true;
        // this._db.queryEntity(this.localEntityId);

        // query all schematic model entities
        // register the schematic models so that it can rendered on the map
        // register for notifications for any changes to the schematic models, in which case the schematic models will be re-rendered (top down)

        // query this schematic using the identifier
        // render this schematic on the map        
    }

    onDatabaseDisconnected() {
        this._isDatabaseConnected = false;
    }

    onQueryEntity(event) {

    }

    onRead(results) {
        for (const result of results) {
            try {
                if (!result.getSuccess()) {
                    continue;
                }

                const protoClass = result.getValue().getTypeName().split('.').reduce((o,i)=> o[i], proto);
                this.selectedNode.entityFields[result.getField()] = {
                    name: result.getField(),
                    value: protoClass.deserializeBinary(result.getValue().getValue_asU8()).getRaw(),
                    typeClass: protoClass,
                    typeName: result.getValue().getTypeName(),
                    writeTime: result.getWritetime().getRaw().toDate().toLocaleString( 'sv-SE', {
                            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                        } ) + "." + result.getWritetime().getRaw().toDate().toLocaleString( 'sv-SE', {
                            fractionalSecondDigits: 3
                        } )
                };

                if (protoClass === proto.qdb.Timestamp) {
                    this.selectedNode.entityFields[result.getField()].value = this.selectedNode.entityFields[result.getField()].value.toDate().toLocaleString( 'sv-SE', {
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    } );
                }

                if (protoClass === proto.qdb.BinaryFile) {                            
                    fetch(this.selectedNode.entityFields[result.getField()].value)
                        .then(res => res.blob())
                        .then(blob => {
                            this.selectedNode.entityFields[result.getField()].blobUrl = window.URL.createObjectURL(blob);
                        });
                }
            } catch (e) {
                qError(`[Schematic::onRead] Failed to process read response: ${e}`);
                continue;
            }
        }
    }

    onRegisterNotification(event) {
        this._notificationTokens = event.tokens;
    }

    onNotification(event) {
        if (event.notification.getCurrent().getName() === "SchemaUpdateTrigger" && !this.selectedNode.notificationTokens.includes(event.notification.getToken()) ) {
            // Received a SchemaUpdateTrigger notification, re-query the schema
            this.database.queryEntity(this.localEntityId);
            return;
        }

        const field = event.notification.getCurrent();

        if (this.selectedNode.entityId !== field.getId()) {
            qWarn(`[Schematic::onNotification] Received notification for entity ${event.notification.getCurrent().getId()} but selected entity is ${this.selectedNode.entityId}`);
            return;
        }
        
        const protoClass = field.getValue().getTypeName().split('.').reduce((o,i)=> o[i], proto);
        this.selectedNode.entityFields[field.getName()] = {
            name: field.getName(),
            value: protoClass.deserializeBinary(field.getValue().getValue_asU8()).getRaw(),
            typeClass: protoClass,
            typeName: field.getValue().getTypeName(),
            writeTime: field.getWritetime().toDate().toLocaleString( 'sv-SE', {
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                } ) + "." + field.getWritetime().toDate().toLocaleString( 'sv-SE', {
                    fractionalSecondDigits: 3
                } )
        };

        if (protoClass === proto.qdb.Timestamp) {
            this.selectedNode.entityFields[field.getName()].value = this.selectedNode.entityFields[field.getName()].value.toDate().toLocaleString( 'sv-SE', {
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            } );
        }

        if (protoClass === proto.qdb.BinaryFile) {
            fetch(this.selectedNode.entityFields[field.getName()].value)
                .then(res => res.blob())
                .then(blob => {
                    this.selectedNode.entityFields[field.getName()].blobUrl = window.URL.createObjectURL(blob);
                });
        }
    }
}