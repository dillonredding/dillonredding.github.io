import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { toggle } from './navbarMenuSlice';

export function NavbarBurger() {
  const hidden = useAppSelector((state) => state.navbarMenu.hidden);
  const dispatch = useAppDispatch();
  return (
    <a
      href="/#"
      role="button"
      className={`navbar-burger ${hidden ? '' : 'is-active'}`}
      aria-label="menu"
      aria-expanded={hidden}
      data-target="navbar-menu"
      onClick={(e) => {
        dispatch(toggle());
        e.preventDefault();
      }}
    >
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </a>
  );
}

export default NavbarBurger;
