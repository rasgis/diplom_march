import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../reducers/productSlice";
import cartReducer from "../reducers/cartSlice";
import authReducer from "../reducers/authSlice";
import categoryReducer from "../reducers/categorySlice";

export const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    auth: authReducer,
    categories: categoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
