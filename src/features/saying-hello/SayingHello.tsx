export function SayingHello() {
  return (
    <>
      <h1 className="title">Saying Hello</h1>
      <div className="field">
        <label htmlFor="name" className="label">
          Name
        </label>
        <div className="control">
          <input id="name" type="text" className="input" placeholder="Enter your name" />
        </div>
      </div>
      <div className="field">
        <div className="control">
          <button className="button is-link">Greet Me</button>
        </div>
      </div>
    </>
  );
}

export default SayingHello;
