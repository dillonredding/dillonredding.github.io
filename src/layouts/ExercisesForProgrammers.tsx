import { Columns, Container } from 'react-bulma-components';
import { Outlet } from 'react-router-dom';
import ExerciseMenu from '../features/e4p/ExerciseMenu';

export function ExercisesForProgrammers() {
  return (
    <Container>
      <Columns>
        <Columns.Column narrow>
          <ExerciseMenu />
        </Columns.Column>
        <Columns.Column>
          <Outlet />
        </Columns.Column>
      </Columns>
    </Container>
  );
}
