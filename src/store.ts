import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./reducers/productSlice";
import cartReducer from "./reducers/cartSlice";
import authReducer from "./reducers/authSlice";
import categoryReducer from "./reducers/categorySlice";

export interface RootState {
  products: ReturnType<typeof productReducer>;
  cart: ReturnType<typeof cartReducer>;
  auth: ReturnType<typeof authReducer>;
  categories: ReturnType<typeof categoryReducer>;
}

export const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    auth: authReducer,
    categories: categoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch;
