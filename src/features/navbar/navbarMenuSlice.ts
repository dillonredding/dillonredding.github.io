import { createSlice } from '@reduxjs/toolkit';

interface NavbarMenuState {
  hidden: boolean;
}

const initialState: NavbarMenuState = {
  hidden: true
};

export const navbarMenuSlice = createSlice({
  name: 'navbar-menu',
  initialState,
  reducers: {
    toggle: (state) => {
      state.hidden = !state.hidden;
    }
  }
});

export const { toggle } = navbarMenuSlice.actions

export default navbarMenuSlice.reducer
