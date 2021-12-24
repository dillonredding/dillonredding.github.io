import MenuItem from './MenuItem';

export function Menu() {
  return (
    <aside className="menu">
      {/* <p className="menu-label">1. Turning Problems into Code</p>
      <ul className="menu-list">
        <MenuItem to="/e4p/0">0. Tax Calculator</MenuItem>
      </ul> */}
      <p className="menu-label">2. Input, Processing, and Output</p>
      <ul className="menu-list">
        <MenuItem to="/e4p/1">1. Saying Hello</MenuItem>
        <MenuItem to="/e4p/2">2. Counting Characters</MenuItem>
        <MenuItem to="/e4p/3">3. Printing Quotes</MenuItem>
        {/* <MenuItem to="/e4p/4">4. Mad Lib</MenuItem> */}
        {/* <MenuItem to="/e4p/5">5. Simple Math</MenuItem> */}
        {/* <MenuItem to="/e4p/6">6. Retirement Calculator</MenuItem> */}
      </ul>
    </aside>
  );
}

export default Menu;
