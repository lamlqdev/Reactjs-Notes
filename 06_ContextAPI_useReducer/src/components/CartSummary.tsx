import {
  useCartState,
  useCartDispatch,
  selectTotal,
  selectItemCount,
} from "../context/CartContext";

// Subscribes to CartStateContext to derive total and item count.
export function CartSummary() {
  const state = useCartState();
  const dispatch = useCartDispatch();

  const total = selectTotal(state);
  const itemCount = selectItemCount(state);

  return (
    <section className="panel summary-panel">
      <h2>Summary</h2>
      <div className="summary-body">
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-label">Items</span>
            <span className="stat-value">{itemCount}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total</span>
            <span className="stat-value total">${total.toFixed(2)}</span>
          </div>
        </div>
        <button
          className="clear-btn"
          disabled={itemCount === 0}
          onClick={() => dispatch({ type: "CLEAR_CART" })}
        >
          Clear Cart
        </button>
      </div>
    </section>
  );
}
