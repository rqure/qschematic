function registerSaveToastComponent(app, context) {
    return app.component('save-toast', {
        data() {
            return {
                shared: context.shared,
            };
        },

        template: `
            <div class="toast-container position-fixed bottom-0 end-0 p-3">
                <div id="save-toast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header">
                        <svg class=" rounded me-2" width="20" height="20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img">
                        <rect fill="#32cd32" width="100%" height="100%" /></svg>
                        <strong class="me-auto">Changes saved!</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
                    <div class="toast-body">
                        Changes to '{{ (shared.selected || {}).name }}' have been saved.
                    </div>
                </div>
            </div>
        `
    });
}