import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { navbarMenuReducer } from '../features/navbar';
import { printingQuotesReducer } from '../features/e4p/printing-quotes';

export const store = configureStore({
  reducer: {
    navbarMenu: navbarMenuReducer,
    printingQuotes: printingQuotesReducer
  }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
