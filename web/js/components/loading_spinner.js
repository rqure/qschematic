class LoadingSpinner {
    constructor() {
        this.spinner = document.createElement('div');
        this.spinner.classList.add('loading-spinner');
        this.spinner.innerHTML = `<div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>`;
    }

    show() {
        document.body.appendChild(this.spinner);
    }

    hide() {
        document.body.removeChild(this.spinner);
    }
}