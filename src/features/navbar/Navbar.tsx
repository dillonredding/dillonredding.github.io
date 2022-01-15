import { Container, Icon, Navbar as Nav } from 'react-bulma-components';
import { Link } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { closeNavbarMenu, toggleNavbarMenu } from './navbarMenuSlice';

export const Navbar = () => {
  const hidden = useAppSelector((state) => state.navbarMenu.hidden);
  const dispatch = useAppDispatch();
  return (
    <Nav className="is-spaced" active={!hidden}>
      <Container>
        <Nav.Brand>
          <Nav.Burger onClick={() => dispatch(toggleNavbarMenu())} />
        </Nav.Brand>
        <Nav.Menu>
          <Nav.Container align="right">
            <Nav.Item renderAs={Link} to="/" onClick={() => dispatch(closeNavbarMenu())}>
              Home
            </Nav.Item>
            <Nav.Item href="https://github.com/dillonredding" target="_blank" rel="noreferrer">
              <Icon>
                <i className="fab fa-github fa-lg"></i>
              </Icon>
            </Nav.Item>
            <Nav.Item href="https://twitter.com/dillon_redding" target="_blank" rel="noreferrer">
              <Icon>
                <i className="fab fa-twitter fa-lg"></i>
              </Icon>
            </Nav.Item>
            <Nav.Item href="https://dillonredding.medium.com" target="_blank" rel="noreferrer">
              <Icon>
                <i className="fab fa-medium fa-lg"></i>
              </Icon>
            </Nav.Item>
          </Nav.Container>
        </Nav.Menu>
      </Container>
    </Nav>
  );
};

export default Navbar;
