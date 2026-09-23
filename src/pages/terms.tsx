import React from 'react';
import ReactDOM from 'react-dom/client';

// same self-hosted latin subsets as the main entry — no CDN, no hotlink
import '@fontsource/libre-baskerville/latin-400.css';
import '@fontsource/libre-baskerville/latin-700.css';
import '@fontsource/poppins/latin-300.css';
import '@fontsource/poppins/latin-400.css';
import '@fontsource/poppins/latin-500.css';

import '../styles/index.css';
import { LegalPage } from '../LegalPage';
import { terms } from '../data/legal';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <LegalPage doc={terms} />
  </React.StrictMode>,
);
