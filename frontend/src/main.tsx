import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            className: "!bg-ph-dark-2 !text-white !border !border-ph-border !shadow-lg",
            duration: 3000,
          }}
        />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
