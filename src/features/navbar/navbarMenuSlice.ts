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
    closeNavbarMenu: (state) => {
      state.hidden = true;
    },
    toggleNavbarMenu: (state) => {
      state.hidden = !state.hidden;
    }
  }
});

export const { closeNavbarMenu, toggleNavbarMenu } = navbarMenuSlice.actions;

export default navbarMenuSlice.reducer;
