class LoadingSpinner {
    constructor() {
        this.spinner = document.createElement('div');
        this.spinner.classList.add('loading-spinner');
        this.spinner.innerHTML = `<div class="loading-spinner">
            <div class="spinner"></div>
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