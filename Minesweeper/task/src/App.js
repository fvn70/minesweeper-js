import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
      <div className="App">
         <div className="Game">
            <header className="App-header">
                <p>Minesweeper</p>
                <img src={logo} className="App-logo" alt="logo" />
            </header>
            <Controls />
             <Field/>
         </div>
      </div>
  );
}

export default App;

function Controls() {
    return (
        <div className="Panel">
            <p className="FlagsCounter">10</p>
            <button className="Reset">Reset</button>
            <p className="Timer">0:00</p>
        </div>
    );
}

function Cell(prop) {
    return (
        <div className="cell">{prop.value}</div>
    )
}

function Field() {
    const arr = Array(72);
    arr.fill('*');
    const cells = arr.map((v, index) =>
        <Cell key={index} value={v.value} />);
    return (
        <div className="Field">
            {cells}
        </div>
    );
}