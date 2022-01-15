import { useState } from 'react';
import { Form, Heading } from 'react-bulma-components';

export function CountingCharacters() {
  const [text, setText] = useState('');
  const { length } = text;
  return (
    <>
      <Heading>Counting Characters</Heading>
      <Form.Textarea placeholder="Enter some text" value={text} onChange={(event) => setText(event.target.value)} />
      <Form.Help>
        {length} character{length === 1 ? '' : 's'}
      </Form.Help>
    </>
  );
}

export default CountingCharacters;
