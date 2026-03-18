import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = 'Ombr Finance';

function createLoadingOverlay() {
    if (document.getElementById('ombr-loading-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'ombr-loading-overlay';
    overlay.innerHTML = `
        <div class="ombr-loading-backdrop"></div>
        <div class="ombr-loading-content">
            <div class="ombr-coin-container">
                <div class="ombr-coin">
                    <div class="ombr-coin-front">
                        <svg viewBox="0 0 40 40" fill="none">
                            <circle cx="20" cy="20" r="18" stroke="#C85D3A" stroke-width="2"/>
                            <text x="20" y="25" text-anchor="middle" fill="#C85D3A" font-size="14" font-weight="bold" font-family="Inter, sans-serif">O</text>
                        </svg>
                    </div>
                    <div class="ombr-coin-back">
                        <svg viewBox="0 0 40 40" fill="none">
                            <circle cx="20" cy="20" r="18" stroke="#C85D3A" stroke-width="2"/>
                            <text x="20" y="25" text-anchor="middle" fill="#C85D3A" font-size="11" font-weight="600" font-family="Inter, sans-serif">KSh</text>
                        </svg>
                    </div>
                </div>
            </div>
            <div class="ombr-loading-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('ombr-loading-visible'));
}

function removeLoadingOverlay() {
    const overlay = document.getElementById('ombr-loading-overlay');
    if (!overlay) return;
    overlay.classList.remove('ombr-loading-visible');
    overlay.classList.add('ombr-loading-hiding');
    setTimeout(() => overlay.remove(), 400);
}

let loadingTimer = null;

router.on('start', () => {
    clearTimeout(loadingTimer);
    loadingTimer = setTimeout(createLoadingOverlay, 150);
});

router.on('finish', () => {
    clearTimeout(loadingTimer);
    removeLoadingOverlay();
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: false,
});
