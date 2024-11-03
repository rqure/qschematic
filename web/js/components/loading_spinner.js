class LoadingSpinner {
    constructor() {
        this.spinner = document.createElement('div');
        this.spinner.classList.add('loading-spinner');
        this.spinner.innerHTML = `<div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>`;
        this.isVisible = false;
    }

    show() {
        if (this.isVisible) {
            return;
        }

        this.isVisible = true;
        document.body.appendChild(this.spinner);
    }

    hide() {
        if (!this.isVisible) {
            return;
        }

        this.isVisible = false;
        document.body.removeChild(this.spinner);
    }
}