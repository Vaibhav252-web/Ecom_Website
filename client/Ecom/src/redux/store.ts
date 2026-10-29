import { configureStore } from '@reduxjs/toolkit';
import { authUserApi } from '../service/user.auth';
import { authProductApi } from '../service/product.auth';
import { authProductCartApi } from '../service/productCart.auth';
import idReducer from '../utils/productIdSlice'
// import { notesApi } from '../service/note.auth';

export const store = configureStore({
  reducer: {
    [authUserApi.reducerPath]: authUserApi.reducer,
    [authProductApi.reducerPath]: authProductApi.reducer,
    [authProductCartApi.reducerPath]: authProductCartApi.reducer,
    activeId: idReducer,
    // [notesApi.reducerPath]: notesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authUserApi.middleware).concat(authProductApi.middleware).concat(authProductCartApi.middleware)
  // .concat(notesApi.middleware),

});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;