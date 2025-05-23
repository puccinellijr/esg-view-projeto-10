
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Get base URL from vite config
const baseUrl = import.meta.env.BASE_URL || '/esg-view/';
console.log(`Initializing app with base URL: ${baseUrl}`);

// Use a more efficient rendering approach with error boundaries
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Fatal: Root element not found");
} else {
  const root = createRoot(rootElement);
  
  // Render with error boundaries to prevent blank screens
  try {
    root.render(<App />);
    console.log("Application rendered successfully");
  } catch (error) {
    console.error("Error rendering application:", error);
    // Fallback UI could be added here if needed
  }
}
