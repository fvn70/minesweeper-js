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

function Field() {
    const arr = mines();
    // arr.fill('*');
    const cells = arr.map((v, index) =>
        <Cell key={index} data={v} />);
    return (
        <div className="Field">
            {cells}
        </div>
    );
}

function mines() {
    const arr = Array(72);
    arr.fill('');
    arr.fill('*', 0, 10);
    for (let i = 0; i < 10; i++) {
        let j = 10 + Math.floor(Math.random() * 62);
        let tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
        console.log(i, j, arr[i], arr[j]);
    }
    return arr;
}

class Cell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isClosed: true,
            isMarked: false,
            isMined: props.data === '*'
        }
        this.handleRClick = this.handleRClick.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState(prev => ({
            isClosed: false
        }));
    }

    handleRClick(e) {
        e.preventDefault();
        this.setState(prev => ({
            isMarked: !prev.isMarked
        }));
    }

    render() {
        let cls = "cell";
        if (!this.state.isClosed) {
            cls += " cell-open"
            if (this.state.isMined) {
                cls += " cell-mine"
            }
        } else if (this.state.isMarked) {
            cls += " cell-mark"
        }
        return (
            <div className={cls}
                 onClick={this.handleClick}
                 onContextMenu={this.handleRClick}>
                { this.state.isClosed
                    ? this.state.isMarked ? '#' : ''
                    : this.state.isMined ? '&' : ''
                }
            </div>
        )
    }
}

