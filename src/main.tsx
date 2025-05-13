
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { NotificationsProvider } from '@/contexts/NotificationsContext'

createRoot(document.getElementById("root")!).render(
  <NotificationsProvider>
    <App />
  </NotificationsProvider>
);
