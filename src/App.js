import React from 'react';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Data from './components/telemetry.js';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <MainContent />
        <Data />
      </main>
      <footer>
        {/* Conteúdo do footer */}
      </footer>
    </div>
  );
}

export default App; 
