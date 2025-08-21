import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import store from './store';
import { Provider } from 'react-redux';

import './index.css';
import './assets/css/agent.css';
import './assets/css/auth.css';
import './assets/css/base.css';
import './assets/css/dashboard.css';
import './assets/css/inventory.css';
import './assets/css/profile.css';
import './assets/css/layout.css';

// Buffer polyfill for browser compatibility
import { Buffer } from 'buffer';
window.Buffer = Buffer;

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <Provider store={store}>
        <App />
    </Provider>
); 