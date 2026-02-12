import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./AuthSlice";
import categoryReducer from "./CategorySlice";
import productReducer from "./ProductSlice"
import orderReducer from "./OrderSlice";
import analyticsReducer from "./AnalyticsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoryReducer,
    products: productReducer,
    orders: orderReducer,
    analytics: analyticsReducer
  }
});
