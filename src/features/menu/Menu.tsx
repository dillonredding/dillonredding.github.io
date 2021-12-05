export function Menu() {
  return (
    <aside className="menu">
      <p className="menu-label">Exercises for Programmers</p>
      <ul className="menu-list">
        <li>
          <a href="/#" onClick={(e) => e.preventDefault()}>
            1. Saying Hello
          </a>
        </li>
        <li>
          <a href="/#" className="is-active" onClick={(e) => e.preventDefault()}>
            2. Counting Characters
          </a>
        </li>
        <li>
          <a href="/#" onClick={(e) => e.preventDefault()}>
            3. Printing Quotes
          </a>
        </li>
        <li>
          <a href="/#" onClick={(e) => e.preventDefault()}>
            4. Mad Lib
          </a>
        </li>
        <li>
          <a href="/#" onClick={(e) => e.preventDefault()}>
            5. Simple Math
          </a>
        </li>
        <li>
          <a href="/#" onClick={(e) => e.preventDefault()}>
            6. Retirement Calculator
          </a>
        </li>
      </ul>
    </aside>
  );
}

export default Menu;
