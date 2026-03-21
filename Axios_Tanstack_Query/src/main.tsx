import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ReactQueryProvider } from "./providers/react-query.provider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReactQueryProvider>
      <App />
    </ReactQueryProvider>
  </React.StrictMode>
);
