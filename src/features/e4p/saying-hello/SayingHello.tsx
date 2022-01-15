import { useState } from 'react';
import { Button, Form, Heading } from 'react-bulma-components';

import GreetingModal from './GreetingModal';

export function SayingHello() {
  const [name, setName] = useState('');
  const [showGreeting, setShowGreeting] = useState(false);
  return (
    <>
      <Heading>Saying Hello</Heading>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowGreeting(true);
        }}
      >
        <Form.Field>
          <Form.Label htmlFor="name">Name</Form.Label>
          <Form.Control>
            <Form.Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Form.Control>
        </Form.Field>
        <Form.Field>
          <Form.Control>
            <Button color="link" onClick={() => setShowGreeting(true)}>
              Greet
            </Button>
          </Form.Control>
        </Form.Field>
        <GreetingModal greeting={makeGreeting(name)} show={showGreeting} onClose={() => setShowGreeting(false)} />
      </form>
    </>
  );
}

function makeGreeting(name: string) {
  switch (name.toLowerCase()) {
    case 'dillon':
      return 'Are you me?';
    case 'dillon redding':
      return 'Go work on something else!';
    default:
      return `Hello, ${name}!`;
  }
}

export default SayingHello;
