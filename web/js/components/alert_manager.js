class Alert {
    constructor(title, description, color = '--bs-primary', onclick=null) {
        this._title = title;
        this._description = description;

        if (color.startsWith('--')) {
            color = getBootstrapVariableColor(color);
        }

        this._color = color;

        this.onclick = onclick;
    }

    get html() {
        return `
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <svg class="rounded me-2" width="20" height="20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img">
                    <rect fill="${this._color}" width="100%" height="100%" />
                </svg>
                <strong class="me-auto">${this._title}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${this._description}
            </div>
        </div>`;
    }
}

class AlertManager {
    constructor() {
        this._alertContainer = document.createElement('div');
        this._alertContainer.classList.add('toast-container', 'position-fixed', 'bottom-0', 'end-0', 'p-3');
        document.body.appendChild(this._alertContainer);

        this._alerts = [];
    }

    addAlert(alert) {
        const alertElement = document.createElement('div');
        alertElement.innerHTML = alert.html;
        const toastElement = alertElement.firstElementChild;
        const toast = new bootstrap.Toast(toastElement);
        this._alertContainer.appendChild(toastElement);
        toast.show();
        this._alerts.push({ alert, toastElement });

        if (alert.onclick) {
            toastElement.querySelectorAll('.toast-body').forEach((element) => {
                element.style.cursor = 'pointer';
                element.addEventListener('click', alert.onclick);
            });
        }

        toastElement.addEventListener('hidden.bs.toast', () => {
            this.removeAlert(alert);
        });
    }

    removeAlert(alert) {
        const alertIndex = this._alerts.findIndex(a => a.alert === alert);

        if (alertIndex !== -1) {
            const { toastElement } = this._alerts[alertIndex];
            this._alertContainer.removeChild(toastElement);
            this._alerts.splice(alertIndex, 1);
        }
    }
}
