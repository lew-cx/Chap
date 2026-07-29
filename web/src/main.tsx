import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App.tsx';
import { startEventStream } from './store/events.ts';
import './styles/index.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root missing from index.html');

// One subscription for the whole app, outside React. The rail and the events
// explorer read the same ring buffer, and StrictMode cannot open a second stream.
startEventStream();

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
