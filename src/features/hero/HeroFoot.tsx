import { Link, useLocation } from 'react-router-dom';

interface TabProps {
  children: string;
  to: string;
}

function Tab(props: TabProps) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(props.to);
  return (
    <li className={isActive ? 'is-active' : ''}>
      <Link to={props.to}>{props.children}</Link>
    </li>
  );
}

function HeroFoot() {
  return (
    <div className="hero-foot">
      <nav className="tabs is-boxed is-centered">
        <ul>
          <Tab to="/e4p">Exercises for Programmers</Tab>
        </ul>
      </nav>
    </div>
  );
}

export default HeroFoot;
