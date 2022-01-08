import { useState } from 'react';

export function SayingHello() {
  const [name, setName] = useState('');
  const [isGreetingActive, setIsGreetingActive] = useState(false);
  return (
    <>
      <h1 className="title">Saying Hello</h1>
      <div className="field">
        <label htmlFor="name" className="label">
          Name
        </label>
        <div className="control">
          <input
            id="name"
            type="text"
            className="input"
            placeholder="Enter your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
      </div>
      <div className="field">
        <div className="control">
          <button className="button is-link" onClick={() => setIsGreetingActive(true)}>
            Greet
          </button>
        </div>
      </div>
      <GreetingModal name={name} active={isGreetingActive} onClose={() => setIsGreetingActive(false)} />
    </>
  );
}

interface GreetingModalProps extends Pick<ModalProps, 'active' | 'onClose'> {
  name: string;
}

function GreetingModal(props: GreetingModalProps) {
  return (
    <Modal active={props.active} onClose={props.onClose}>
      <div className="box has-text-centered">
        <p className="title">{makeGreeting(props.name)}</p>
      </div>
    </Modal>
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

interface ModalProps<T = JSX.Element> extends ParentProps<T> {
  active: boolean;
  onClose: () => void;
}

interface ParentProps<T = JSX.Element> {
  children: T;
}

export function Modal(props: ModalProps) {
  return (
    <div className={'modal' + (props.active ? ' is-active' : '')}>
      <div className="modal-background" onClick={props.onClose} />
      <div className="modal-content">{props.children}</div>
      <button className="modal-close is-large" aria-label="close" onClick={props.onClose}></button>
    </div>
  );
}

export default SayingHello;
