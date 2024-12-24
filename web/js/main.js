const Q_STORE = new QEntityStore({
    port: ":20000"
});

async function main() {
    Q_CURRENT_LOG_LEVEL=Q_LOG_LEVELS.DEBUG;
    
    Q_STORE.runInBackground(true);

    const recenter = () => {
        canvas.moveTo(canvas.center, 5);
    }

    const canvas = new Canvas('schematic');
    canvas
        .setMinZoom(1)
        .setMaxZoom(10)
        .setBoundary({x: 0, y: 0}, {x: 1000, y: 1000})
        .moveTo(canvas.center, 5);

    const coordinates = document.getElementById('coordinates');
    canvas.onmousemove.add((point) => {
        coordinates.innerHTML = `X: ${point.x}, Y: ${point.y}, Z: ${point.z}`;
    });
    canvas.onzoom.add((point) => {
        coordinates.innerHTML = `X: ${point.x}, Y: ${point.y}, Z: ${point.z}`;
    });

    const recenterButton = document.getElementById('recenter-btn');
    recenterButton.onclick = recenter;

    // Theme toggling
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const icon = themeToggleBtn.querySelector('i');
    
    // Load saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

    themeToggleBtn.onclick = () => {
        const currentTheme = document.documentElement.getAttribute('data-bs-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-bs-theme', newTheme);
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('theme', newTheme);
        
        // Update canvas background using Bootstrap colors
        canvas.setBackgroundColor(`var(--bs-body-bg)`);
    };

    // Set initial canvas background using Bootstrap colors
    canvas.setBackgroundColor(`var(--bs-body-bg)`);

    const schematic = new Schematic(canvas, Q_STORE);
    schematic.setIdentifer("Main");
    schematic.recenter = recenter;
}