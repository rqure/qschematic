/** Class Name	    CSS Variable
    bg-primary	    --bs-primary
    bg-secondary	--bs-secondary
    bg-success	    --bs-success
    bg-danger	    --bs-danger
    bg-warning	    --bs-warning
    bg-info	        --bs-info
    bg-light	    --bs-light
    bg-dark	        --bs-dark
    bg-body	        --bs-body
    text-primary	--bs-primary
    text-secondary	--bs-secondary
    text-success	--bs-success
    text-danger	    --bs-danger
    text-warning	--bs-warning
    text-info	    --bs-info
    text-light	    --bs-light
    text-dark	    --bs-dark
*/
function getBootstrapVariableColor(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

class DrawableShape extends Drawable {
    constructor() {
        super();
        this._self = null;
        this._color = 'red';
        this._fillColor = '#f03';
        this._fillOpacity = 0.5;
        this._weight = 1;
        this._contextMenu = null;
        this._contextMenuItems = [];
    }
    
    setColor(value) {
        if (value.startsWith('--')) {
            value = getBootstrapVariableColor(value);
        }

        this._color = value;
        return this;
    }

    setBorderColor(value) {
        if (value.startsWith('--')) {
            value = getBootstrapVariableColor(value);
        }

        this._color = value;
        return this;
    }

    setFillColor(value) {
        if (value.startsWith('--')) {
            value = getBootstrapVariableColor(value);
        }

        this._fillColor = value;
        return this;
    }

    setFillOpacity(value) { this._fillOpacity = value; return this; }
    setWeight(value) { this._weight = value; return this; }

    addContextMenuItem(label, callback) {
        this._contextMenuItems.push({ label, callback });
        return this;
    }

    __showContextMenu(event) {
        if (this._contextMenu) {
            this._contextMenu.remove();
        }

        // Create context menu
        this._contextMenu = document.createElement('div');
        this._contextMenu.className = 'context-menu';
        this._contextMenu.style.position = 'fixed';
        this._contextMenu.style.left = `${event.originalEvent.clientX}px`;
        this._contextMenu.style.top = `${event.originalEvent.clientY}px`;
        this._contextMenu.style.zIndex = 1000;

        // Add menu items
        this._contextMenuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.textContent = item.label;
            menuItem.onclick = () => {
                item.callback.call(this);
                this._contextMenu.remove();
            };
            this._contextMenu.appendChild(menuItem);
        });

        document.body.appendChild(this._contextMenu);

        // Close menu when clicking outside
        const closeMenu = (e) => {
            if (!this._contextMenu.contains(e.target)) {
                this._contextMenu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
    }

    drawImplementation() {}

    erase() {
        if (this._self !== null) {
            this._self.remove();
            this._self = null;
        }

        super.erase();
    }

    draw(canvas) {
        this.erase();

        if (canvas.zoom < this._minZoom) {
            return;
        }

        super.draw(canvas);
        this._self = this.drawImplementation();

        if (this._pane && !canvas.implementation.getPane(this._pane.name)) {
            canvas.implementation.createPane(this._pane.name);
            canvas.implementation.getPane(this._pane.name).style.zIndex = this._pane.level;
        }

        this._self.addTo(canvas.implementation);

        if (this._self && this._contextMenuItems.length > 0) {
            this._self.on('contextmenu', (event) => {
                event.originalEvent.preventDefault();
                this.__showContextMenu(event);
            });
        }

        this.onDraw();
    }

    onDraw() {}
};