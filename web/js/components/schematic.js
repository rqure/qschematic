class Schematic {
    constructor(canvas, database) {
        this._identifier = null;
        this._canvas = canvas;
        this._model = null;
        this._db = database;
        this._dataManager = new DataManager(database);

        this._modelRegistry = {};
        this.__registerModel('Polygon', () => new Polygon());
        this.__registerModel('Polyline', () => new Polyline());
        this.__registerModel('Circle', () => new Circle());
        this.__registerModel('Image', () => new ImageOverlay());
        this.__registerModel('Text', () => new Text());
        this.__registerModel('SvgText', () => new SvgText());

        this._db
            .getEventManager()
            .addEventListener(DATABASE_EVENTS.CONNECTED, this.__onDatabaseConnected.bind(this))
            .addEventListener(DATABASE_EVENTS.DISCONNECTED, this.__onDatabaseDisconnected.bind(this));
    }

    __registerModel(id, generator) {
        this._modelRegistry[id] = generator;
    }

    __registerCustomModel(id, source) {
        this.__registerModel(id, this.__generateModel.bind(this, source));
    }

    __generateModel(source) {
        const model = new Model();

        if (!source.model) {
            qError("[Schematic::__generateModel] Invalid source: missing model.");
            return model;
        }

        if (source.model.location) {
            model.setOffset(new Point(source.model.location.x, source.model.location.y));
        }

        if (source.model.offset) {
            model.setOffset(new Point(source.model.offset.x, source.model.offset.y));
        }

        if (source.model.scale) {
            model.setScale(source.model.scale);
        }

        if (source.model.rotation) {
            model.setRotation(source.model.rotation);
        }

        if (source.model.pane && source.model.pane.name && source.model.pane.level) {
            model.setPane(new Pane(
                source.model.pane.name, source.model.pane.level
            ));
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
            const newShape = this._modelRegistry[shape.type]();
            
            if (!newShape) {
                qError(`[Schematic::__generateModel] Unknown shape type: ${shape.type}`);
                return;
            }

            if (shape.location) {
                newShape.setOffset(new Point(shape.location.x, shape.location.y));
            }

            if (shape.scale) {
                newShape.setScale(new Point(shape.scale.x, shape.scale.y));
            }

            if (shape.rotation) {
                newShape.setRotation(shape.rotation);
            }

            if (shape.pane && shape.pane.name && shape.pane.level) {
                newShape.setPane(new Pane(
                    shape.pane.name, shape.pane.level
                ));
            }

            if (shape.radius) {
                newShape.setRadius(shape.radius);
            }

            if (shape.color) {
                newShape.setColor(shape.color);
            }

            if (shape.fillColor) {
                newShape.setFillColor(shape.fillColor);
            }

            if (shape.fillOpacity) {
                newShape.setFillOpacity(shape.fillOpacity);
            }

            if (shape.weight) {
                newShape.setWeight(shape.weight);
            }

            if (shape.width) {
                newShape.setWidth(shape.width);
            }

            if (shape.height) {
                newShape.setHeight(shape.height);
            }

            if (shape.fontSize) {
                newShape.setFontSize(shape.fontSize);
            }

            if (shape.text) {
                newShape.setText(shape.text);
            }

            if (shape.direction) {
                newShape.setDirection(shape.direction);
            }

            if (shape.className) {
                newShape.setClassName(shape.className);
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
            .findModels()
            .then(models => {
                models.forEach(([id, identifier, source]) => {
                    this.__registerCustomModel(identifier, source);

                    this._dataManager.listenForSourceChange(id, source => {
                        this.__registerCustomModel(identifier, source);
                    });
                });
            })
            .then(() => this._dataManager.findSchematic(this._identifier))
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