class Navigator {
    constructor(schematic) {
        this._schematic = schematic;
    }

    navigateTo(identifier) {
        this._schematic.setIdentifer(identifier);
    }

    moveTo(point) {
        this._schematic.canvas.moveTo(point, point.z);
    }
}

class Schematic {
    constructor(canvas, store) {
        this._identifier = null;
        this._canvas = canvas;
        this._model = null;
        this._store = store;
        this._dataManager = new DataManager(store);
        this._modelSource = null;
        this._loadingSpinner = new LoadingSpinner();
        this._alertManager = new AlertManager();

        this._modelRegistry = {};
        this.__registerModel('Circle', () => new Circle());
        this.__registerModel('Div', () => new Div());
        this.__registerModel('Image', () => new ImageOverlay());
        this.__registerModel('Polygon', () => new Polygon());
        this.__registerModel('Polyline', () => new Polyline());
        this.__registerModel('SvgText', () => new SvgText());
        this.__registerModel('Text', () => new Text());

        this._store
            .getEventManager()
            .addEventListener(Q_STORE_EVENTS.CONNECTED, this.__onStoreConnected.bind(this))
            .addEventListener(Q_STORE_EVENTS.DISCONNECTED, this.__onStoreDisconnected.bind(this));
        
        if (!this._store.isConnected()) {
            this._loadingSpinner.show();
        }
    }

    get canvas() {
        return this._canvas;
    }

    get navigator() {
        return new Navigator(this);
    }

    get alertManager() {
        return this._alertManager;
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

        if (config.scaleWithZoom && shape.setScaleWithZoom) {
            shape.setScaleWithZoom(config.scaleWithZoom);

            const callback = (point) => {
                shape.setZoom(point.z);
                shape.draw(this._canvas);
            };

            this._canvas.onzoom.add(callback)
            shape.ondestroy.add(() => this._canvas.onzoom.remove(callback));
        }

        if (config.minZoom && shape.setMinZoom) {
            shape.setMinZoom(config.minZoom);

            const callback = (point) => {
                if (point.z < config.minZoom) {
                    shape.erase();
                } else {
                    shape.draw(this._canvas);
                }
            };

            this._canvas.onzoom.add(callback)
            shape.ondestroy.add(() => this._canvas.onzoom.remove(callback));
        }

        if (config.html && shape.setHtml) {
            shape.setHtml(config.html);
        }

        if (config.edges && Array.isArray(config.edges) && shape.addEdge) {
            config.edges.forEach(edge => {
                shape.addEdge(new Point(edge.x, edge.y));
            });
        }

        if (config.canvasBackground) {
            // if starts with -- then it is a bootstrap variable
            if (config.canvasBackground.startsWith('--')) {
                config.canvasBackground = getBootstrapVariableColor(config.canvasBackground);
            }

            this._canvas.element.style.backgroundColor = config.canvasBackground;
        }

        if (config.styles && shape.setStyles) {
            shape.setStyles(config.styles);
        }
 
        if (config.animations && shape.setAnimations) {
            shape.setAnimations(config.animations);
        }

        shape.setWriter(this._dataManager.writer);
        shape.setNavigator(this.navigator);
        shape.setAlertManager(this.alertManager);

        if (config.handlers && typeof config.handlers === 'object') {
            Object.entries(config.handlers).forEach(([entityIdField, handlerImpl]) => {
                const callback = eval(`( function(erase, draw, value, isNotification) { erase(); try { ${handlerImpl}; } catch (e) { qError("[Schematic::__applyShapeConfig] callback failed to execute for shape ${config.type} (${entityIdField})"); console.log(e); } draw(); } )`)
                    .bind(shape,
                        shape.erase.bind(shape),
                        shape.draw.bind(shape, this._canvas));

                this._dataManager.notify(entityIdField, callback)
                shape.ondestroy.add(() => this._dataManager.unnotify(entityIdField, callback));
            });
        }

        if (config.methods && typeof config.methods === 'object') {
            Object.entries(config.methods).forEach(([methodName, methodImpl]) => {
                try {
                    const callback = eval(`( ${methodImpl} )`).bind(shape);
                    shape[methodName] = function(...args) {
                        try {                            
                            return callback(...args);
                        } catch (e) {
                            qError(`[Schematic::__applyShapeConfig] Failed to execute method: ${config.type}.${methodName}: ${e}`);
                        }
                    }.bind(shape);
                } catch (e) {
                    qError(`[Schematic::__applyShapeConfig] Failed to apply method: ${config.type}.${methodName}: ${e}`);
                }
            });

            if (shape.init && typeof shape.init === 'function') {
                shape.init();
            }
        }

        if (config.contextMenu && typeof config.contextMenu === 'object') {
            Object.entries(config.contextMenu).forEach(([label, handlerImpl]) => {
                try {
                    const callback = eval(`( ${handlerImpl} )`).bind(shape);
                    shape.addContextMenuItem(label, callback);
                } catch (e) {
                    qError(`[Schematic::__applyShapeConfig] Failed to add context menu item: ${label}: ${e}`);
                }
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

        (source.model.shapes || []).forEach(shapeConfig => {
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

    __onStoreConnected() {
        if (this._identifier === null) {
            return;
        }

        this._loadingSpinner.show();

        this._dataManager
            .unnotifyAll()
            .then(() => this._dataManager.findModels())
            .then(models => {
                models.forEach(([id, identifier, source]) => {
                    this.__registerCustomModel(identifier, source);

                    this._dataManager.listenForSourceChange(id, source => {
                        qDebug(`[Schematic::__onStoreConnected] Model ${identifier} changed.`);
                        this.__registerCustomModel(identifier, source);
                        this.rerender();
                    });
                });
            })
            .then(() => this._dataManager.findSchematic(this._identifier))
            .then((args) => {
                const [id, source] = args;
                this.setSource(source);
                this._dataManager.listenForSourceChange(id, source => {
                    qDebug(`[Schematic::__onStoreConnected] Schematic ${this._identifier} changed.`);
                    this.setSource(source);
                });
            })
            .then(() => {
                if( this.recenter ) {
                    this.recenter();
                    this._canvas.onzoom.callbacks.forEach(callback => callback(this._canvas.mousePosition));
                }

                this._loadingSpinner.hide();
            })
            .catch(error => {
                qError(`[Schematic::__onStoreConnected] ${error}`);
            });
    }

    __onStoreDisconnected() {
        this._loadingSpinner.show();
    }

    setIdentifer(value) {
        this._identifier = value;

        if( this._store.isConnected() ) {
            this.__onStoreConnected();
        }

        return this;
    }

    setSource(value) {
        this._modelSource = value;

        this.rerender();

        return this
    }

    setModel(value) {
        if (this._model !== null) {
            this._model.erase();
            this._model.destroy();
            this._model = null;
        }

        this._model = value;

        if (this._model) {
            this._model.draw(this._canvas);
        }

        return this;
    }

    rerender() {
        this.setModel(this.__generateModel(this._modelSource));
    }
}