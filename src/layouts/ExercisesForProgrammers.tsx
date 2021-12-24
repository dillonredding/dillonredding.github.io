import { Outlet } from 'react-router-dom';
import Menu from '../features/e4p/menu';

export function ExercisesForProgrammers() {
  return (
    <div className="container">
      <div className="columns">
        <div className="column is-narrow">
          <Menu />
        </div>
        <div className="column">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
