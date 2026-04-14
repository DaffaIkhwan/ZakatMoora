import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/globals.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ConfirmProvider } from "./hooks/use-confirm";
import { ThemeProvider } from "./components/theme-provider";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </ThemeProvider>
  </ErrorBoundary>
);
