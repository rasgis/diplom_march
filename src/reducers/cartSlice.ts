import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "../types";
import { authService } from "../services/authService";

interface CartState {
  items: CartItem[];
  total: number;
}

// Функция для получения ключа корзины в localStorage
const getCartStorageKey = (): string => {
  const user = authService.getUser();
  return user ? `cart_${user.id}` : "cart_guest";
};

// Функция для загрузки корзины из localStorage
export const loadCartFromStorage = (): CartState => {
  try {
    const cartData = localStorage.getItem(getCartStorageKey());
    if (cartData) {
      return JSON.parse(cartData);
    }
  } catch (error) {
    console.error("Ошибка при загрузке корзины из localStorage:", error);
  }
  return { items: [], total: 0 };
};

// Функция для сохранения корзины в localStorage
const saveCartToStorage = (cart: CartState) => {
  try {
    localStorage.setItem(getCartStorageKey(), JSON.stringify(cart));
  } catch (error) {
    console.error("Ошибка при сохранении корзины в localStorage:", error);
  }
};

const initialState: CartState = loadCartFromStorage();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.total = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      saveCartToStorage(state);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.total = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      saveCartToStorage(state);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        state.total = state.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      }
      saveCartToStorage(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      saveCartToStorage(state);
    },
    loadCart: (state) => {
      const cart = loadCartFromStorage();
      state.items = cart.items;
      state.total = cart.total;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  loadCart,
} = cartSlice.actions;

export default cartSlice.reducer;
