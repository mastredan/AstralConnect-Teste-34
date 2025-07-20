import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Garantir que apenas uma instância da aplicação seja montada
const rootElement = document.getElementById("root")!;
if (rootElement.children.length === 0) {
  createRoot(rootElement).render(<App />);
}
