class Alert {
    constructor(title, description, iconClass = 'fa-circle-info', onclick = null) {
        this._title = title;
        this._description = description;
        this._iconClass = iconClass;
        this.onclick = onclick;
    }

    get html() {
        return `
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <i class="fas ${this._iconClass} me-2 toast-icon"></i>
                <strong class="me-auto">${this._title}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${this._description}
            </div>
            ${this.onclick ? `
            <div class="toast-footer">
                <small class="text-muted">
                    <i class="fas fa-arrow-right me-1"></i>
                    Click for more details
                </small>
            </div>` : ''}
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
            // Make both body and footer clickable
            ['toast-body', 'toast-footer'].forEach(className => {
                toastElement.querySelectorAll(`.${className}`).forEach((element) => {
                    element.style.cursor = 'pointer';
                    element.addEventListener('click', alert.onclick);
                    // Add focus listeners for keyboard navigation
                    element.addEventListener('focus', () => toastElement.classList.add('has-focus'));
                    element.addEventListener('blur', () => toastElement.classList.remove('has-focus'));
                    // Make the elements focusable
                    element.setAttribute('tabindex', '0');
                });
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
