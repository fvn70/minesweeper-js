import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

const mineNumber = 10;
const sizeX = 8;
const sizeY = 9;

function App() {
  return (
      <div className="App">
          <Game/>
      </div>
  );
}

export default App;

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            flags: 10,
            startGame: false,
            endGame: false
        };
    }

    flagChanged = () => {
        this.setState(prev => ({flags: prev.flags - 1}));
    }

    stateChanged = (start, end) => {
        this.setState({startGame: start});
        this.setState({endGame: end});
    }

    render() {
        return (
            <div className="Game">
                <header className="App-header">
                    <p>Minesweeper</p>
                    <img src={logo} className="App-logo" alt="logo" />
                </header>
                <Controls
                    flags={this.state.flags}
                    start={this.state.startGame}
                />
                <Field
                    flags={this.state.flags}
                    onFlagChange={this.flagChanged}
                    onStartGame={this.stateChanged}
                    endGame={this.state.endGame}
                />
            </div>
        )
    }
}

// props: (flags, start, stop)
class Controls extends React.Component {
    constructor(props) {
        super(props);
        this.state = {timer: 0};
    }

    render() {
        const button = (this.props.start) ? "Start" : "Stop";
        return (
            <div className="Panel">
                <p className="FlagsCounter">{this.props.flags}</p>
                {/*<button className="Reset">Reset</button>*/}
                <button className="Reset">{button}</button>
                <Timer start={this.props.start}/>
                {/*<p className="Timer">{this.state.timer}</p>*/}
            </div>
        );
    }
}

// props: (flags, onFlagChange, onStartGame, endGame)
class Field extends React.Component {
    constructor(props) {
        super(props);
        this.state={ iCell: -1, data: this.mines() }
    }

    handleClick = (v) => {
        const idx = v;
        const cell = this.state.data[idx];
        const end = this.props.endGame || cell === 'X';
        const start = idx >= 0 && !end;
        this.props.onStartGame(start, end);
        if (cell === '.') {
            openCells(idx, this.state.data);
            // view2d(this.state.data);
        }
    }

    handleRClick = (e) => {
        if (this.props.flags > 0) {
            this.props.onFlagChange();
        }
    }

    render() {
        const cells = this.state.data.map((cell, idx) =>
            <Cell key={idx}
                  cell={cell}
                  iCell={idx}
                  onCellClick={this.handleClick}
                  onSetMark={this.handleRClick}
                  endGame={this.props.endGame}
                  flags={this.props.flags}
            />);
        return (
            <div className="Field">
                {cells}
            </div>
        )
    }

    mines() {
        const n = sizeX * sizeY;
        const arr = Array(n).fill('.')
        let cnt = mineNumber;
        while (cnt) {
            let i = Math.floor(Math.random() * n);
            if (arr[i] !== 'X') {
                arr[i] = 'X';
                cnt--;
            }
        }
        this.cntMines(arr);

        // view2d(arr);
        return arr;
    }

    cntMines(arr) {
        arr.forEach( (cell, idx, arr) => {
            if (cell !== 'X') {
                let n = this.cntNeighbors(idx, arr);
                if (n > 0) {
                    arr[idx] = parseInt(n);
                }
            }
        });
    }

    cntNeighbors(iCell, arr) {
        let cnt = 0
        let r = Math.trunc(iCell / sizeX);
        let c = iCell % sizeX;

        for (let i = r - 1; i <= r + 1; i++) {
            for (let j = c - 1; j <= c + 1; j++) {
                if (0 <= i && i < sizeY && 0 <= j && j < sizeX) {
                    let k = i * sizeX + j;
                    if (arr[k] === 'X') {
                        cnt++;
                    }
                }
            }
        }
        return cnt
    }
}

// props: (cell, iCell, onCellClick, onSetMark, endGame)
class Cell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isClosed: true,
            isMarked: false,
            isMined: props.cell === 'X'
        }
    }

    handleClick = () => {
        this.setState(prev => ({
            isClosed: false }));
        this.props.onCellClick(this.props.iCell);
    }

    handleRClick = (e) => {
        e.preventDefault();
        if (this.props.flags > 0 && this.state.isClosed) {
            this.props.onSetMark();
            this.setState(prev => ({
                isMarked: !prev.isMarked
            }));
        }
    }

    render() {
        const isOpen = this.props.cell === '0';
        if (isOpen && this.state.isClosed) {
            this.setState({isClosed: false});
        }
        let cls = "cell";
        if (!this.state.isClosed || isOpen) {
            cls += " cell-open"
            if (this.state.isMined) {
                cls += " cell-mine"
            }
        } else if (this.state.isMarked) {
            cls += " cell-mark"
        }
        // console.log('Cell=', cls, this.props.cell, this.props.iCell, isOpen)
        return (
            <div className={cls}
                 onClick={this.handleClick}
                 onContextMenu={this.handleRClick}>
                { this.state.isClosed || isOpen
                    ? '' : this.props.cell
                }
            </div>
        )
    }
}

function view2d(arr) {
    // 1d --> 2d
    const arr1 = [].concat(...arr);
    const arr2 = [];
    while (arr1.length) arr2.push(arr1.splice(0, sizeX));
    console.log(arr2);
}

function openCells(idx, arr) {
    // console.log("openCells=", idx, arr[idx]);
    if (arr[idx] === '.') {
        // console.log("idx=", idx, arr[idx]);
        arr[idx] = '0';
        let r = Math.trunc(idx / sizeX);
        let c = idx % sizeX;
        for (let i = r - 1; i <= r + 1; i++) {
            for (let j = c - 1; j <= c + 1; j++) {
                if (0 <= i && i < sizeY && 0 <= j && j < sizeX) {
                    let k = i * sizeX + j;
                    // console.log("k=", k, arr[k]);
                    if (k !== idx && arr[k] === '.') {
                        openCells(k, arr);
                    }
                }
            }
        }
    } else {
        return
    }
}

const Timer = (props) => {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);

    if (props.start && !isActive) {
        setIsActive(true);
    }
    if (!props.start && isActive) {
        setIsActive(false);
    }

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds + 1);
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    let m = Math.trunc(seconds / 60);
    let s = seconds % 60;
    return (
        <p className="Timer">{`${m}:${s > 9 ? s : '0' + s}`}</p>
    )
}
