class Schematic {
    constructor(canvas, database) {
        this._identifier = null;
        this._canvas = canvas;
        this._model = null;
        this._db = database;
        this._dataManager = new DataManager(database);

        this._db
            .getEventManager()
            .addEventListener(DATABASE_EVENTS.CONNECTED, this.__onDatabaseConnected.bind(this))
            .addEventListener(DATABASE_EVENTS.DISCONNECTED, this.__onDatabaseDisconnected.bind(this));
    }

    __generateModel(source) {
        const model = new Model();
        if (source.model.location) {
            model.setLocation({ x: source.model.location.x, y: source.model.location.y });
        }
        if (source.model.offset) {
            model.setOffset({ x: source.model.offset.x, y: source.model.offset.y });
        }
        source.model.shapes.forEach(shape => {
            let newShape;
            
            if (shape.type === "Polygon") {
                newShape = new Polygon();
            } else if (shape.type === "Polyline") {
                newShape = new Polyline();
            } else {
                qError(`[Schematic::__generateModel] Unknown shape type: ${shape.type}`);
                return;
            }
            if (shape.location) {
                newShape.setLocation({ x: shape.location.x, y: shape.location.y });
            }
            if (shape.edges && Array.isArray(shape.edges)) {
                shape.edges.forEach(edge => {
                    newShape.addEdge({ x: edge.x, y: edge.y });
                });
            }
            model.addShape(newShape);
        });
        return model;
    }

    __onDatabaseConnected() {
        if (this._identifier === null) {
            return;
        }

        this._dataManager
            // .findModels()
            // .then(models => {
            //     console.log(models);
            //     models.forEach(model => {
            //         this._dataManager.listenForSourceChange(model.getId(), source => {
            //             console.log(source);
            //             eval(source);
            //         });
            //     });
            // })
            // .then(() => this._dataManager.findSchematic(this._identifier))
            .findSchematic(this._identifier)
            .then((args) => {
                const [id, source] = args;
                this.setModel(this.__generateModel(source));
                this._dataManager.listenForSourceChange(id, source => {
                    this.setModel(this.__generateModel(source));
                });
            })
            .catch(error => {
                qError(`[Schematic::__onDatabaseConnected] ${error}`);
            });
    }

    __onDatabaseDisconnected() {
    }

    setIdentifer(value) {
        this._identifier = value;

        if( this._db.isConnected() ) {
            this.__onDatabaseConnected();
        }

        return this;
    }

    setModel(value) {
        if (this._model !== null) {
            this._model.erase();
            this._model = null;
        }

        this._model = value;
        this._model.draw(this._canvas);

        return this;
    }
}