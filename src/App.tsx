import React from 'react';
// import logo from './logo.svg';
// import { Counter } from './features/counter/Counter';
// import './App.css';

export enum IconStyle {
  Solid = 'fas',
  Brands = 'fab'
}

export enum IconSize {
  Normal = '',
  Large = 'fa-lg',
  ExtraLarge = 'fa-2x'
}

export enum IconType {
  FileIcon = 'file-icon',
  Icon = 'icon',
  PanelIcon = 'panel-icon'
}

export enum IconContainerSize {
  Small = 'is-small',
  Normal = '',
  Medium = 'is-medium',
  Large = 'is-large'
}

export interface IconProps {
  name: string;
  style?: IconStyle;
  size?: IconSize;
  type?: IconType;
  containerSize?: IconContainerSize;
  left?: boolean;
}

export const Icon = ({
  name,
  style = IconStyle.Solid,
  size = IconSize.Normal,
  type = IconType.Icon,
  containerSize = IconContainerSize.Normal,
  left = false
}: IconProps) => (
  <span className={`${type} ${containerSize} ${left ? 'is-left' : ''}`}>
    <i className={`${style} fa-${name} ${size}`}></i>
  </span>
);

function App() {
  return (
    <div className="App">
      <nav className="navbar is-spaced" role="navigation" aria-label="main navigation">
        <div className="container">
          <div className="navbar-brand">
            <a
              href="/#"
              role="button"
              className="navbar-burger"
              aria-label="menu"
              aria-expanded="false"
              data-target="navbarBasicExample"
            >
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </a>
          </div>
          <div id="navbarBasicExample" className="navbar-menu">
            <div className="navbar-end">
              <a
                className="navbar-item"
                href="https://github.com/dillonredding"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="github" style={IconStyle.Brands} size={IconSize.Large} />
              </a>
              <a
                className="navbar-item"
                href="https://twitter.com/dillon_redding"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="twitter" style={IconStyle.Brands} size={IconSize.Large} />
              </a>
              <a
                className="navbar-item"
                href="https://medium.com/@dillonredding"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="medium" style={IconStyle.Brands} size={IconSize.Large} />
              </a>
            </div>
          </div>
        </div>
      </nav>
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Counter />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <span>
          <span>Learn </span>
          <a
            className="App-link"
            href="https://reactjs.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            React
          </a>
          <span>, </span>
          <a
            className="App-link"
            href="https://redux.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Redux
          </a>
          <span>, </span>
          <a
            className="App-link"
            href="https://redux-toolkit.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Redux Toolkit
          </a>
          ,<span> and </span>
          <a
            className="App-link"
            href="https://react-redux.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            React Redux
          </a>
        </span>
      </header> */}
    </div>
  );
}

export default App;
