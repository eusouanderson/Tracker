import React from 'react';

function Header() {
  return (
    <header className="App-header">
      <h1>ETS2 Telemetry Dashboard</h1>
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
