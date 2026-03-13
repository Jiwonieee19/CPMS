import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import ToastProvider from './Components/ToastProvider'

createInertiaApp({
    title: (title) => {
        const appName = 'CPMS'
        return title ? `${title} | ${appName}` : appName
    },
    resolve: name => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
        return pages[`./Pages/${name}.jsx`]
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <ToastProvider>
                <App {...props} />
            </ToastProvider>
        )
    },
})