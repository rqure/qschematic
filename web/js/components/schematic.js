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
            model.setOffset(new Point(source.model.location.x, source.model.location.y));
        }
        if (source.model.scale) {
            model.setScale(source.model.scale);
        }
        if (source.model.rotation) {
            model.setRotation(source.model.rotation);
        }
        if (source.model.handlers) {
            Object.entries(source.model.handlers).forEach(([entityIdField, handlerImpl]) => {
                const callback = eval(`( function(erase, draw, value) { erase(); ${handlerImpl}; draw(); } )`)
                .bind(model,
                    model.erase.bind(model),
                    model.draw.bind(model, this._canvas));

                this._dataManager.notify(entityIdField, callback)
                model.onDestroy = () => this._dataManager.unnotify(entityIdField, callback);
            });
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

            if (shape.pivot) {
                newShape.setPivot(new Point(shape.pivot.x, shape.pivot.y));
            }

            if (shape.rotation) {
                newShape.setRotation(shape.rotation);
            }

            if (shape.scale) {
                newShape.setScale(new Point(shape.scale.x, shape.scale.y));
            }

            if (shape.offset) {
                newShape.setOffset(new Point(shape.offset.x, shape.offset.y));
            }

            if (shape.edges && Array.isArray(shape.edges)) {
                shape.edges.forEach(edge => {
                    newShape.addEdge(new Point(edge.x, edge.y));
                });
            }

            if (shape.handlers) {
                Object.entries(shape.handlers).forEach(([entityIdField, handlerImpl]) => {
                    const callback = eval(`( function(erase, draw, value) { erase(); ${handlerImpl}; draw(); } )`)
                        .bind(newShape,
                            newShape.erase.bind(newShape),
                            newShape.draw.bind(newShape, this._canvas));

                    this._dataManager.notify(entityIdField, callback)
                    newShape.onDestroy = () => this._dataManager.unnotify(entityIdField, callback);
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
            this._model.destroy();
            this._model = null;
        }

        this._model = value;
        this._model.draw(this._canvas);

        return this;
    }
}