import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { actions } from "@/state/store";
import "./index.css";

void actions.completeAccOAuth();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
