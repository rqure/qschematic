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

    __applyShapeConfig(shape, config) {
        if (config.location && shape.setOffset) {
            shape.setOffset(new Point(config.location.x, config.location.y));
        }

        if (config.scale && shape.setScale) {
            shape.setScale(new Point(config.scale.x, config.scale.y));
        }

        if (config.pane && config.pane.name && config.pane.level && shape.setPane) {
            shape.setPane(new Pane(
                config.pane.name, config.pane.level
            ));
        }

        if (config.radius && shape.setRadius) {
            shape.setRadius(config.radius);
        }

        if (config.color && shape.setColor) {
            shape.setColor(config.color);
        }

        if (config.fillColor && shape.setFillColor) {
            shape.setFillColor(config.fillColor);
        }

        if (config.fillOpacity && shape.setFillOpacity) {
            shape.setFillOpacity(config.fillOpacity);
        }

        if (config.weight && shape.setWeight) {
            shape.setWeight(config.weight);
        }

        if (config.width && shape.setWidth) {
            shape.setWidth(config.width);
        }

        if (config.height && shape.setHeight) {
            shape.setHeight(config.height);
        }

        if (config.fontSize && shape.setFontSize) {
            shape.setFontSize(config.fontSize);
        }

        if (config.text && shape.setText) {
            shape.setText(config.text);
        }

        if (config.direction && shape.setDirection) {
            shape.setDirection(config.direction);
        }

        if (config.className && shape.setClassName) {
            shape.setClassName(config.className);
        }

        if (config.pivot && shape.setPivot) {
            shape.setPivot(new Point(config.pivot.x, config.pivot.y));
        }

        if (config.rotation && shape.setRotation) {
            shape.setRotation(config.rotation);
        }

        if (config.scale && shape.setScale) {
            shape.setScale(new Point(config.scale.x, config.scale.y));
        }

        if (config.offset && shape.setOffset) {
            shape.setOffset(new Point(config.offset.x, config.offset.y));
        }

        if (config.edges && Array.isArray(config.edges) && shape.addEdge) {
            config.edges.forEach(edge => {
                shape.addEdge(new Point(edge.x, edge.y));
            });
        }

        if (config.canvasBackground) {
            this._canvas.element.style.backgroundColor = config.canvasBackground;
        }

        if (config.handlers) {
            Object.entries(config.handlers).forEach(([entityIdField, handlerImpl]) => {
                const callback = eval(`( function(erase, draw, value) { erase(); ${handlerImpl}; draw(); } )`)
                    .bind(shape,
                        shape.erase.bind(shape),
                        shape.draw.bind(shape, this._canvas));

                this._dataManager.notify(entityIdField, callback)
                shape.onDestroy = () => this._dataManager.unnotify(entityIdField, callback);
            });
        }
    }

    __generateModel(source) {
        if (!source.model) {
            qError("[Schematic::__generateModel] Invalid source: missing model.");
            return new Model();
        }

        let model = null;
        if (source.model.type && this._modelRegistry[source.model.type]) {
            model = this._modelRegistry[source.model.type]();

            if (!model) {
                qError(`[Schematic::__generateModel] Unknown model type: ${source.model.type}`);
                return new Model();
            }
        } else {
            model = new Model();
        }

        this.__applyShapeConfig(model, source.model);

        source.model.shapes.forEach(shapeConfig => {
            const newShapeFn = this._modelRegistry[shapeConfig.type];
            if (!newShapeFn) {
                qError(`[Schematic::__generateModel] Unknown shape type: ${shapeConfig.type}`);
                return;
            }

            const newShape = newShapeFn();
            if (!newShape) {
                qError(`[Schematic::__generateModel] Failed to create shape of type: ${shapeConfig.type}`);
                return;
            }

            model.addShape(newShape);

            this.__applyShapeConfig(newShape, shapeConfig);
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