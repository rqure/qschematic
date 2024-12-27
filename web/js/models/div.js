class Div extends DrawableShape {
    constructor() {
        super();
        this._html = '';
        this._className = '';
        this._width = 0;
        this._height = 0;
        this._scaleWithZoom = false;
        this._zoom = 1;
        this._marker = null;
        this.onclick = null;
        this.onrender = null;
        this._styles = new Map();
        this._animations = new Map();
        this._styleElement = null;

        this.ondestroy.add(() => this._marker = null);
    }

    get html() {
        return this._html;
    }

    get className() {
        return this._className;
    }

    get width() {
        // Remove zoom scaling from base width since we handle it via CSS
        return this._width;
    }

    get height() {
        // Remove zoom scaling from base height since we handle it via CSS
        return this._height;
    }

    get scaleWithZoom() {
        return this._scaleWithZoom;
    }

    get zoomScaleFactor() {
        if (!this.scaleWithZoom) {
            return 1;
        }

        return Math.pow(2, this.zoom - this.minZoom);
    }

    get zoom() {
        return this._zoom;
    }

    get marker() {
        return this._marker;
    }

    get element() {
        if (this._marker) {
            return this._marker.getElement();
        }

        return null;
    }

    setClassName(value) {
        this._className = value;
        return this;
    }

    setHtml(value) {
        this._html = value;
        return this;
    }

    setWidth(value) {
        this._width = value;
        return this;
    }

    setHeight(value) {
        this._height = value;
        return this;
    }

    setZoom(value) {
        this._zoom = value;
        return this;
    }

    setScaleWithZoom(value) {
        this._scaleWithZoom = value;
        return this;
    }

    setStyles(styles) {
        if (!styles) return this;
        this._styles = new Map(Object.entries(styles));
        return this;
    }

    setAnimations(animations) {
        if (!animations) return this;
        this._animations = new Map(Object.entries(animations));
        return this;
    }

    applySmoothScaling() {
        const element = this._marker.getElement();

        if (element) {
            const scaleFactor = this.zoomScaleFactor;

            // Add base container scaling
            const container = element.querySelector('.leaflet-div-icon');
            if (container) {
                container.style.width = `${this._width}px`;
                container.style.height = `${this._height}px`;
            }

            // Scale inner components
            element.querySelectorAll('.component-to-scale').forEach((component) => {
                component.style.transformOrigin = 'center';
                component.style.transform = `scale(${scaleFactor})`;
                component.style.transition = 'transform 0.3s ease-in-out';
            });

            element.querySelectorAll('.text-to-scale').forEach((textElement) => {
                textElement.style.transformOrigin = 'center';
                textElement.style.transform = `scale(${scaleFactor})`;
                textElement.style.transition = 'transform 0.3s ease-in-out';
            });

            element.querySelectorAll('.component-to-rotate').forEach((component) => {
                component.style.transformOrigin = 'center';
                component.style.transform = `rotate(${this.absolute_rotation}deg) scale(${scaleFactor})`;
                component.style.transition = 'transform 0.3s ease-in-out';
            });
        }
    }

    __applyStyles() {
        if (!this.element || (this._styles.size === 0 && this._animations.size === 0)) return;

        // Create or get style element
        let styleId = `style-${this._id}`;
        this._styleElement = document.getElementById(styleId);
        if (!this._styleElement) {
            this._styleElement = document.createElement('style');
            this._styleElement.id = styleId;
            document.head.appendChild(this._styleElement);
        }

        // Build CSS content
        let css = '';

        // Add animations
        this._animations.forEach((keyframes, name) => {
            css += `@keyframes ${name} {
                ${Object.entries(keyframes).map(([key, value]) => 
                    `${key} { ${Object.entries(value).map(([prop, val]) => 
                        `${prop}: ${val}`).join('; ')} }`
                ).join('\n')}
            }\n`;
        });

        // Add styles
        this._styles.forEach((rules, selector) => {
            css += `#${this.element.id} ${selector} {
                ${Object.entries(rules).map(([prop, value]) => 
                    `${prop}: ${value}`).join(';\n    ')}
            }\n`;
        });

        this._styleElement.textContent = css;
    }

    drawImplementation() {
        const icon = L.divIcon({
            className: this._className,
            html: this._html,
            iconSize: [this.width, this.height],
            iconAnchor: [this.width / 2, this.height / 2]  // Center the icon
        });

        if (!this._marker) {
            this._marker = L.marker([this.location.y, this.location.x], {
                icon: icon,
                interactive: true
            });

            if (this.onclick && typeof this.onclick === 'function') {
                this._marker.on("click", this.onclick.bind(this));
            }
        } else {
            this._marker.setIcon(icon);
        }

        this.__applyStyles();
        return this._marker;
    }

    onDraw() {
        if (this._scaleWithZoom) {
            this.applySmoothScaling();
        }

        if (this.onrender && typeof this.onrender === 'function') {
            this.onrender();
        }
    }

    destroy() {
        if (this._styleElement) {
            this._styleElement.remove();
            this._styleElement = null;
        }
        super.destroy();
    }
}