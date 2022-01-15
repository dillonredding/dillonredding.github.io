import { Outlet } from 'react-router-dom';
import { Container, Heading, Hero, Tabs } from 'react-bulma-components';
import { Link, useLocation } from 'react-router-dom';

import Navbar from '../features/navbar';

export function Home() {
  const location = useLocation();
  return (
    <>
      <Hero color="dark" className="mb-5">
        <Hero.Header>
          <Navbar />
        </Hero.Header>
        <Hero.Body>
          <Container className="has-text-centered">
            <Heading>dillonredding.github.io</Heading>
            <Heading subtitle>My website for random side projects and UI fun.</Heading>
          </Container>
        </Hero.Body>
        <Hero.Footer>
          <Tabs type="boxed" align="center">
            <Tabs.Tab renderAs={Link} to="/e4p" active={location.pathname.startsWith('/e4p')}>
              Exercises for Programmers
            </Tabs.Tab>
          </Tabs>
        </Hero.Footer>
      </Hero>
      <Outlet />
    </>
  );
}
