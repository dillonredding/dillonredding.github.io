import { useState } from 'react';

export function CountingCharacters() {
  const [text, setText] = useState('');
  const { length } = text;
  return (
    <>
      <h1 className="title">Counting Characters</h1>
      <textarea
        className="textarea"
        placeholder="Enter some text"
        onChange={(event) => {
          setText(event.target.value);
        }}
      >
        {text}
      </textarea>
      <p className="help">
        {length} character{length === 1 ? '' : 's'}
      </p>
    </>
  );
}

export default CountingCharacters;
