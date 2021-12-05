import NavbarMenu from './NavbarMenu';
import NavbarBurger from './NavbarBurger';

export const Navbar = () => (
  <nav className="navbar is-spaced" role="navigation" aria-label="main navigation">
    <div className="container">
      <div className="navbar-brand">
        <span className="navbar-item is-size-5 has-text-weight-bold">
          dillonredding.github.io
        </span>
        <NavbarBurger />
      </div>
      <NavbarMenu id="navbar-menu" />
    </div>
  </nav>
);

export default Navbar;
