
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// We're not including the Toaster component from UI here since notifications
// are handled exclusively through the NotificationPanel component with the bell icon

createRoot(document.getElementById("root")!).render(
  <>
    <App />
  </>
);
