import { createContext, useContext, useReducer } from "react";
import type React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

export type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" };

// ─── Reducer ──────────────────────────────────────────────────────────────────

const initialState: CartState = { items: [] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === action.payload.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { ...action.payload, quantity: 1 }] };
    }
    case "REMOVE_ITEM":
      return { items: state.items.filter((i) => i.id !== action.payload) };
    case "UPDATE_QUANTITY":
      return {
        items: state.items.map((i) =>
          i.id === action.payload.id
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
      };
    case "CLEAR_CART":
      return { items: [] };
    default:
      return state;
  }
}

// ─── Split Contexts ───────────────────────────────────────────────────────────
//
// dispatch from useReducer is referentially stable — React guarantees it never
// changes. Keeping it in a separate context means components that only call
// dispatch (e.g. AddItemForm) subscribe to CartDispatchContext only and are
// never re-rendered by state changes.

const CartStateContext = createContext<CartState | undefined>(undefined);
const CartDispatchContext = createContext<
  React.Dispatch<CartAction> | undefined
>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return (
    <CartDispatchContext.Provider value={dispatch}>
      <CartStateContext.Provider value={state}>
        {children}
      </CartStateContext.Provider>
    </CartDispatchContext.Provider>
  );
}

// ─── Custom Hooks ─────────────────────────────────────────────────────────────

export function useCartState(): CartState {
  const state = useContext(CartStateContext);
  if (state === undefined) {
    throw new Error("useCartState must be used within CartProvider");
  }
  return state;
}

export function useCartDispatch(): React.Dispatch<CartAction> {
  const dispatch = useContext(CartDispatchContext);
  if (dispatch === undefined) {
    throw new Error("useCartDispatch must be used within CartProvider");
  }
  return dispatch;
}

// ─── Derived Value Helper ─────────────────────────────────────────────────────

export function selectTotal(state: CartState): number {
  return state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function selectItemCount(state: CartState): number {
  return state.items.reduce((sum, i) => sum + i.quantity, 0);
}
