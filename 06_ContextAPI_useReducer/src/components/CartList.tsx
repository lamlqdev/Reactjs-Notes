import { useCartState, useCartDispatch } from "../context/CartContext";

// Subscribes to CartStateContext (reads items) and CartDispatchContext (mutates).
export function CartList() {
  const { items } = useCartState();
  const dispatch = useCartDispatch();

  if (items.length === 0) {
    return (
      <section className="panel">
        <h2>Cart</h2>
        <p className="empty-msg">Your cart is empty.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Cart</h2>
      <ul className="cart-list">
        {items.map((item) => (
          <li key={item.id} className="cart-row">
            <span className="item-name">{item.name}</span>
            <input
              type="number"
              min={1}
              value={item.quantity}
              className="qty-input"
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_QUANTITY",
                  payload: { id: item.id, quantity: Number(e.target.value) },
                })
              }
            />
            <span className="item-subtotal">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
            <button
              className="remove-btn"
              onClick={() =>
                dispatch({ type: "REMOVE_ITEM", payload: item.id })
              }
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
