import { Menu } from 'react-bulma-components';
import { Link, useLocation } from 'react-router-dom';

type MenuItemConfig = [string, string];
type MenuListConfig = [string, ...MenuItemConfig[]];
type MenuConfig = MenuListConfig[];

const menuConfig: MenuConfig = [
  [
    '2. Input, Processing, and Output',
    ['/e4p/1', '1. Saying Hello'],
    ['/e4p/2', '2. Counting Characters'],
    ['/e4p/3', '3. Printing Quotes']
  ]
];

export function ExerciseMenu() {
  const location = useLocation();
  return (
    <Menu>
      {menuConfig.map(([title, ...items], i) => (
        <Menu.List title={title} key={i}>
          {items.map(([route, text], j) => (
            <Menu.List.Item renderAs={Link} to={route} key={j} active={route === location.pathname}>
              {text}
            </Menu.List.Item>
          ))}
        </Menu.List>
      ))}
    </Menu>
  );
}

export default ExerciseMenu;
