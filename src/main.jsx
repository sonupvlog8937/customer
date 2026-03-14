import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { Provider } from 'react-redux';
import { store } from './store';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker with auto-update
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Naya update available hai! Refresh karein?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ab offline bhi kaam karega!');
  },
});

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <App />
    </Provider>
)