import React from 'react';
import ReactDOM from 'react-dom/client';

// self-hosted fonts — no Google Fonts hotlink, no CDN.
// Latin subsets only: the site is English, so the devanagari/cyrillic faces
// would be dead weight in the bundle.
import '@fontsource/libre-baskerville/latin-400.css';
import '@fontsource/libre-baskerville/latin-700.css';
import '@fontsource/poppins/latin-300.css';
import '@fontsource/poppins/latin-400.css';
import '@fontsource/poppins/latin-500.css';

import './styles/index.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
