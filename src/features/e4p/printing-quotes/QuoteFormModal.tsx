import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bulma-components';
import Quote from './Quote';

export interface QuoteFormModalProps {
  quote?: Quote;
  show: boolean;
  onClose(): void;
  onSubmit(quote: Quote): void;
}

export function QuoteFormModal(props: QuoteFormModalProps) {
  const [text, setText] = useState(props.quote?.text ?? '');
  const [author, setAuthor] = useState(props.quote?.author ?? '');
  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    props.onSubmit({ text, author });
    props.onClose();
    setText('');
    setAuthor('');
  };
  return (
    <Modal show={props.show} closeOnBlur onClose={props.onClose}>
      <Modal.Card>
        <Modal.Card.Header>
          <Modal.Card.Title>{props.quote ? 'Edit Quote' : 'Add a Quote'}</Modal.Card.Title>
        </Modal.Card.Header>
        <Modal.Card.Body>
          <form onSubmit={submit}>
            <Form.Field>
              <Form.Label htmlFor="text">Text</Form.Label>
              <Form.Control>
                <Form.Textarea
                  id="text"
                  placeholder="What is the quote (without quotations)?"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                />
              </Form.Control>
            </Form.Field>
            <Form.Field>
              <Form.Label htmlFor="author">Author</Form.Label>
              <Form.Control>
                <Form.Input
                  id="author"
                  placeholder="Who said it?"
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                />
              </Form.Control>
            </Form.Field>
          </form>
        </Modal.Card.Body>
        <Modal.Card.Footer>
          <Button color="link" onClick={submit}>
            Submit
          </Button>
          <Button onClick={props.onClose}>Cancel</Button>
        </Modal.Card.Footer>
      </Modal.Card>
    </Modal>
  );
}

export default QuoteFormModal;
