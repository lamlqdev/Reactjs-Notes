import { CartProvider } from "./context/CartContext";
import { AddItemForm } from "./components/AddItemForm";
import { CartList } from "./components/CartList";
import { CartSummary } from "./components/CartSummary";
import "./index.css";

function App() {
  return (
    <CartProvider>
      <div className="app">
        <header className="app-header">
          <h1>Shopping Cart</h1>
          <p className="subtitle">Context API + useReducer Demo</p>
        </header>
        <main className="app-grid">
          <AddItemForm />
          <CartList />
          <CartSummary />
        </main>
      </div>
    </CartProvider>
  );
}

export default App;
