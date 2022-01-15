import { Heading } from "react-bulma-components";

export function ExercisesForProgrammersSummary() {
  return (
    <>
      <Heading>Exercises for Programmers</Heading>
      <p className="is-size-5">
        My solutions to problems from{' '}
        <a href="https://pragprog.com/titles/bhwb/exercises-for-programmers/" target="_blank" rel="noreferrer">
          Exercises for Programmers
        </a>{' '}
        by Brian P. Hogan.
      </p>
    </>
  );
}
