import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import React from 'react';
import { ThemeProvider } from '@/Components/ThemeProvider';
import { CartProvider } from '@/Contexts/CartContext';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return <div style={{padding: '20px', background: 'red', color: 'white', zIndex: 9999, position: 'relative'}}><pre>{this.state.error.toString()}\n{this.state.error.stack}</pre></div>;
    }
    return this.props.children;
  }
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ErrorBoundary>
                <ThemeProvider>
                    <CartProvider>
                        <App {...props} />
                    </CartProvider>
                </ThemeProvider>
            </ErrorBoundary>
        );
    },
    progress: {
        color: '#1B4FD8',
    },
});
