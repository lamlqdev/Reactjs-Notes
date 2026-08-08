import { useCartDispatch } from "../context/CartContext";

const PRODUCTS = [
  { id: "1", name: "Apple", price: 1.5 },
  { id: "2", name: "Banana", price: 0.75 },
  { id: "3", name: "Orange", price: 2.0 },
  { id: "4", name: "Mango", price: 3.5 },
];

// Subscribes to CartDispatchContext ONLY.
// dispatch is stable, so this component NEVER re-renders when cart state changes.
export function AddItemForm() {
  const dispatch = useCartDispatch();

  return (
    <section className="panel">
      <h2>Products</h2>
      <ul className="product-list">
        {PRODUCTS.map((product) => (
          <li key={product.id} className="product-row">
            <span className="product-name">{product.name}</span>
            <span className="product-price">${product.price.toFixed(2)}</span>
            <button
              className="add-btn"
              onClick={() =>
                dispatch({ type: "ADD_ITEM", payload: product })
              }
            >
              + Add
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
