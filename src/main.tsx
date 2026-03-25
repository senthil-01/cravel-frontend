import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { CartSummaryProvider } from "@/context/CartSummaryContext";

createRoot(document.getElementById("root")!).render(
  <CartSummaryProvider>
    <App />
  </CartSummaryProvider>
);