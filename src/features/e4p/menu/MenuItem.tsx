import { Link, To, useLocation } from 'react-router-dom';

export interface MenuItemProps {
  children: string;
  to: To;
}

export function MenuItem(props: MenuItemProps) {
  const location = useLocation();
  const isActive = props.to === location.pathname;
  return (
    <li>
      <Link to={props.to} className={isActive ? 'is-active' : ''}>
        {props.children}
      </Link>
    </li>
  );
}

export default MenuItem;
