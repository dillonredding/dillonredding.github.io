import { Link, useLocation } from 'react-router-dom';

function HeroFoot() {
  const location = useLocation();
  return (
    <div className="hero-foot">
      <nav className="tabs is-boxed is-centered">
        <ul>
          <li className={location.pathname.startsWith('/e4p') ? 'is-active' : ''}>
            <Link to="/e4p">Exercises for Programmers</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default HeroFoot;
