import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import navbarMenuReducer from '../features/navbar/navbarMenuSlice';

export const store = configureStore({
  reducer: {
    navbarMenu: navbarMenuReducer
  }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
