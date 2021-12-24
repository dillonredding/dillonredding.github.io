import { Outlet } from 'react-router-dom';
import Hero from '../features/hero';

export function Home() {
  return (
    <>
      <Hero />
      <Outlet />
    </>
  );
}
